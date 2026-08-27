import { NextRequest, NextResponse } from 'next/server'
import { Type, type Content, type FunctionDeclaration } from '@google/genai'
import { z } from 'zod'
import { chat } from '@/lib/ai/gemini'
import { buildSystemPrompt } from '@/lib/ai/knowledge'
import { costUsd, type AiUsage } from '@/lib/ai/pricing'
import { usdToEgp } from '@/lib/ai/fx'
import { createAdminClient } from '@/lib/supabase/admin'
import { quote, NEEDS, MODULE_KEYS } from '@/lib/pricing/quote'
import { SERVICE_VALUES } from '@/lib/service-options'
import { isLocale, defaultLocale } from '@/i18n/config'
import { linkVisitorToLead, VISITOR_COOKIE } from '@/lib/tracking/link-lead'

/**
 * The public website chatbot. Unauthenticated by design — it answers questions
 * for visitors who have not identified themselves.
 *
 * That makes it a spend faucet pointed at the open internet, so the limits
 * below are load-bearing, not decoration: message length, history depth, tool
 * rounds and per-IP rate all cap what a single visitor can cost us.
 */

export const runtime = 'nodejs'
export const maxDuration = 30

const MAX_MESSAGE_CHARS = 1000
/** Turns of history kept; older ones are dropped before the model sees them. */
const MAX_HISTORY = 12
/** Tool round-trips per request. Two is enough for quote-then-answer. */
const MAX_TOOL_ROUNDS = 2
const RATE_LIMIT = { max: 20, windowMs: 10 * 60 * 1000 }

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string().min(1).max(MAX_MESSAGE_CHARS),
      }),
    )
    .min(1)
    .max(60),
  locale: z.string().optional(),
})

/**
 * ponytail: per-instance memory, so a serverless fleet multiplies the effective
 * limit by the number of warm instances. It costs nothing and stops the obvious
 * abuse; move to a Supabase table or Upstash if someone actually works around it.
 */
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs)
  recent.push(now)
  hits.set(ip, recent)
  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < RATE_LIMIT.windowMs)) hits.delete(k)
  }
  return recent.length > RATE_LIMIT.max
}

// ── Tools ───────────────────────────────────────────────────────────────────
// The model collects the inputs and narrates the output. It never computes a
// price and never writes to the database directly.

const TOOLS: FunctionDeclaration[] = [
  {
    name: 'build_quote',
    description:
      'Price any mix of FLOW services, down to a single account-management feature. Call ' +
      'this for ANY question about what a combination, a catalogue size, or one individual ' +
      'capability would cost. Never calculate a total yourself.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        productCount: {
          type: Type.NUMBER,
          description:
            'How many products need one-time content work. Ask if unknown. Use 0 when ' +
            'they only want monthly account management.',
        },
        content: {
          type: Type.ARRAY,
          items: { type: Type.STRING, enum: [...NEEDS] },
          description:
            'One-time, per-product content: photography (studio photos), listing (bilingual SEO copy).',
        },
        modules: {
          type: Type.ARRAY,
          items: { type: Type.STRING, enum: [...MODULE_KEYS] },
          description:
            'Monthly account-management parts they want, and ONLY those. They can buy one ' +
            'on its own — "just create our PO\'s" is modules: ["purchase-orders"]. ' +
            'setup = account creation (one-time), uploading = listing uploads and catalogue ' +
            'upkeep, returns = handling returns, fba = FBA inventory, purchase-orders = ' +
            "raising PO's, brand-registry = Brand Registry, price-analysis = competitor and " +
            'price tracking.',
        },
        platforms: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Marketplaces they sell on, e.g. Amazon, Noon.',
        },
      },
      required: ['productCount'],
    },
  },
  {
    name: 'capture_lead',
    description:
      'Pass the visitor to the FLOW sales team. Only call this once you have their name, ' +
      'a phone number or email, AND their explicit agreement to be contacted.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "The visitor's name." },
        phone: { type: Type.STRING, description: 'Phone or WhatsApp number, if given.' },
        email: { type: Type.STRING, description: 'Email address, if given.' },
        platform: { type: Type.STRING, description: 'Marketplaces they sell on.' },
        interest: {
          type: Type.STRING,
          enum: [...SERVICE_VALUES],
          description: 'Which plan or service they are interested in.',
        },
        summary: {
          type: Type.STRING,
          description: 'One or two sentences on what they need and what was discussed.',
        },
      },
      required: ['name', 'summary'],
    },
  },
]

type Args = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

const pickFrom = <T extends string>(v: unknown, allowed: readonly T[]): T[] =>
  Array.isArray(v) ? v.filter((x): x is T => allowed.includes(x as T)) : []

function runQuote(args: Args) {
  return quote({
    productCount: Number(args.productCount) || 0,
    content: pickFrom(args.content, NEEDS),
    modules: pickFrom(args.modules, MODULE_KEYS),
  })
}

/**
 * Write the lead through the service-role client: this route is
 * unauthenticated, and leads_insert RLS requires the leads.create permission.
 * Mirrors recordLead() in app/api/contact/route.ts so chatbot leads land on the
 * same pipeline board as website enquiries.
 */
async function captureLead(
  args: Args,
  transcript: string,
  visitorId: string | undefined,
): Promise<{ ok: boolean }> {
  const name = str(args.name)
  const phone = str(args.phone)
  const email = str(args.email)
  if (!name || (!phone && !email)) return { ok: false }

  const interest = str(args.interest)
  const notes = [
    str(args.summary),
    '',
    '--- chatbot transcript ---',
    transcript,
  ].join('\n')

  try {
    const admin = createAdminClient()
    const { data: lead, error } = await admin
      .from('leads')
      .insert({
        name,
        email: email?.toLowerCase() ?? null,
        phone: phone ?? null,
        field: str(args.platform) ?? null,
        plan_interest: interest && SERVICE_VALUES.includes(interest) ? interest : null,
        source: 'chatbot',
        notes,
      })
      .select('id')
      .single()
    if (error) throw error

    if (lead?.id) {
      const journey = await linkVisitorToLead(visitorId, lead.id)
      if (journey) {
        await admin
          .from('leads')
          .update({ notes: `${notes}\n\n--- journey ---\n${journey}` })
          .eq('id', lead.id)
      }
    }
    return { ok: true }
  } catch (err) {
    console.error('[chat] could not record lead:', err)
    return { ok: false }
  }
}

/**
 * Pull the trailing `[[SUGGEST: a | b | c]]` marker off a reply.
 *
 * Gemini cannot combine a responseSchema with function declarations, and this
 * route needs the tools, so the suggestions ride inline in the text. The strip
 * is deliberately greedier than the capture: it removes everything from the
 * first `[[SUGGEST` onward, so a truncated or malformed marker still cannot
 * leak into a chat bubble.
 */
const SUGGEST_CAPTURE = /\[\[\s*SUGGEST\s*:([^\]]*)\]\]/i
const SUGGEST_STRIP = /\[\[\s*SUGGEST[\s\S]*$/i

function splitSuggestions(text: string): { reply: string; suggestions: string[] } {
  const m = text.match(SUGGEST_CAPTURE)
  const suggestions = (m?.[1] ?? '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4)
  return { reply: text.replace(SUGGEST_STRIP, '').trim(), suggestions }
}

/** Best-effort cost ledger entry. `job_id` stays null — that marks a chat row. */
async function logUsage(usage: AiUsage) {
  if (!usage.inputTokens && !usage.outputTokens) return
  try {
    const admin = createAdminClient()
    await admin.from('ai_usage').insert({
      job_id: null,
      model: usage.model,
      images: 0,
      input_tokens: usage.inputTokens,
      output_tokens: usage.outputTokens,
      cost_usd: costUsd(usage),
      fx_rate: await usdToEgp(),
    })
  } catch (err) {
    console.error('[chat] could not log ai usage:', err)
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many messages. Please try again in a few minutes.' },
      { status: 429 },
    )
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const visitorId = req.cookies.get(VISITOR_COOKIE)?.value
  const { messages } = parsed.data
  const locale = isLocale(parsed.data.locale) ? parsed.data.locale : defaultLocale
  const history = messages.slice(-MAX_HISTORY)

  const contents: Content[] = history.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }))
  const transcript = history.map((m) => `${m.role === 'user' ? 'Visitor' : 'FLOW'}: ${m.content}`).join('\n')

  const total: AiUsage = { model: '', inputTokens: 0, outputTokens: 0, images: 0 }
  let leadCaptured = false

  try {
    const systemInstruction = await buildSystemPrompt(locale)
    let reply = ''

    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const { value, usage } = await chat(contents, {
        systemInstruction,
        // Drop the tools on the final round so the model is forced to answer
        // in words rather than asking for another call it will never get.
        tools: round < MAX_TOOL_ROUNDS ? TOOLS : undefined,
      })
      total.model = usage.model
      total.inputTokens += usage.inputTokens
      total.outputTokens += usage.outputTokens

      if (!value.functionCalls.length) {
        reply = value.text
        break
      }

      contents.push({ role: 'model', parts: value.functionCalls.map((fc) => ({ functionCall: fc })) })
      for (const call of value.functionCalls) {
        const args = (call.args ?? {}) as Args
        let result: unknown
        if (call.name === 'build_quote') {
          result = runQuote(args)
        } else if (call.name === 'capture_lead') {
          const res = await captureLead(args, transcript, visitorId)
          leadCaptured ||= res.ok
          result = res.ok
            ? { ok: true, message: 'The team has been notified and will reach out shortly.' }
            : { ok: false, message: 'Could not save. Ask for a name plus a phone number or email.' }
        } else {
          result = { error: 'Unknown tool.' }
        }
        contents.push({
          role: 'user',
          parts: [{ functionResponse: { name: call.name ?? '', response: { result } } }],
        })
      }
      // Anything the model said alongside the tool call is worth keeping as a
      // fallback in case the next round comes back empty.
      if (value.text) reply = value.text
    }

    void logUsage(total)

    if (!reply.trim()) {
      return NextResponse.json(
        { error: 'Sorry — something went wrong. Please try again.' },
        { status: 502, headers: { 'Cache-Control': 'no-store' } },
      )
    }

    const { reply: text, suggestions } = splitSuggestions(reply)
    return NextResponse.json(
      { reply: text, suggestions, leadCaptured },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (err) {
    void logUsage(total)
    console.error('[chat] failed:', err)
    return NextResponse.json(
      { error: 'Sorry — something went wrong. Please try again.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
