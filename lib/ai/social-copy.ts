import 'server-only'
import { chat } from '@/lib/ai/gemini'
import { buildSystemPrompt } from '@/lib/ai/knowledge'
import type { SocialPlatform, SocialPillar, SocialFormat } from '@/lib/types'
import type { Billed } from '@/lib/ai/gemini'

export interface CaptionRequest {
  hook: string
  platform: SocialPlatform
  pillar: SocialPillar
  format: SocialFormat
  /** Campaign name, when the post belongs to one. */
  campaign?: string | null
}

export interface CaptionResult {
  captionEn: string
  captionAr: string
  hashtags: string[]
}

/**
 * How each platform actually wants to be written for. Without this the model
 * produces the same mid-length caption everywhere, which reads as wrong on all
 * three.
 */
const PLATFORM_BRIEF: Record<SocialPlatform, string> = {
  instagram:
    'Instagram. Arabic-first, Egyptian colloquial, with English product/marketplace terms left in English. ' +
    'Short lines with blank lines between them. Lead with the hook in the first line — everything after "more" is unread. ' +
    '80–140 words.',
  facebook:
    'Facebook. Arabic, aimed at Egyptian marketplace sellers who are practical and time-poor. ' +
    'Plain, useful, no marketing gloss. Numbered or bulleted where it is genuinely a list. 100–180 words.',
  linkedin:
    'LinkedIn. English-first, professional but not corporate. One idea argued properly, not a listicle. ' +
    'No emoji, no hashtag spam, no "thoughts?" sign-off. 150–250 words. ' +
    'Links suppress reach, so never put a URL in the body.',
}

const PILLAR_BRIEF: Record<SocialPillar, string> = {
  proof: 'Show the work. Concrete and specific about what was done — never about what it achieved commercially.',
  teach: 'Teach one thing a seller can act on today. Assume they are competent and busy.',
  process: 'Explain how FLOW works. Honest about limits, including where AI stops and a person takes over.',
  offer: 'State the offer plainly. Price or deadline, no manufactured scarcity.',
  pulse: 'Comment on the Egyptian e-commerce market. An observation, not a prediction.',
}

/**
 * The two rules that are not style preferences — they are commitments from the
 * company handbook, and a caption that breaks either is unpublishable.
 */
const HARD_RULES = `
ABSOLUTE CONSTRAINTS. Breaking either makes the caption unusable:

1. NEVER promise or imply a delivery date, turnaround time, or "ready in N days".
   Production confirms dates, and marketing does not. Urgency may only come from
   a booking cut-off, which is a capacity fact.
2. NEVER guarantee or imply a sales figure, a search ranking, a conversion rate,
   or "page one" placement. Do not invent client results or percentages. If the
   post wants a number, use only these true ones: 210+ products photographed,
   8 categories, 4 marketplaces, per-item content from 10 EGP, monthly plans
   from 3,500 EGP.

Also: never claim FLOW runs paid advertising as a service, sources products,
holds inventory, or does web development. It does not.
`.trim()

const FORMAT_JSON = `
Reply with nothing but a JSON object, no code fence:
{"captionEn": "...", "captionAr": "...", "hashtags": ["#one", "#two"]}

captionAr is a caption written natively in Arabic — NOT a translation of
captionEn. The two should make the same argument to a different reader, in the
words that reader actually uses. 3–6 hashtags, mixed English and Arabic, no
more.
`.trim()

/**
 * Draft a bilingual caption for one planned post.
 *
 * Reuses the website chatbot's system prompt so captions inherit the company
 * handbook and the live rate card — which is what stops the model inventing a
 * price. Returns the usage so the caller can bill it to `ai_usage` alongside
 * automation spend.
 */
export async function generateCaption(req: CaptionRequest): Promise<Billed<CaptionResult>> {
  const base = await buildSystemPrompt('en')

  const systemInstruction = [
    base,
    '',
    '--- WRITING A SOCIAL POST ---',
    'You are writing one social media post for FLOW, in FLOW\'s own voice:',
    'direct, unhyped, willing to say what it does not do. No exclamation marks.',
    'No "unlock", "elevate your business", "game-changer", or agency filler.',
    '',
    HARD_RULES,
    '',
    FORMAT_JSON,
  ].join('\n')

  const brief = [
    `Platform: ${PLATFORM_BRIEF[req.platform]}`,
    `Pillar: ${PILLAR_BRIEF[req.pillar]}`,
    `Format: ${req.format}`,
    req.campaign ? `Campaign: ${req.campaign}` : null,
    '',
    `The post's idea: ${req.hook}`,
  ]
    .filter(Boolean)
    .join('\n')

  const { value, usage } = await chat([{ role: 'user', parts: [{ text: brief }] }], {
    systemInstruction,
    temperature: 0.8,
  })

  return { value: parseCaption(value.text), usage }
}

/**
 * The model is asked for bare JSON and mostly complies, but a fenced block or a
 * sentence of preamble is common enough that failing on it would make the
 * feature feel broken. Pull the first balanced object out instead.
 */
function parseCaption(text: string): CaptionResult {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) {
    throw new Error('The model did not return a caption. Try again.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text.slice(start, end + 1))
  } catch {
    throw new Error('The model returned a malformed caption. Try again.')
  }

  const obj = parsed as Record<string, unknown>
  const captionEn = typeof obj.captionEn === 'string' ? obj.captionEn.trim() : ''
  const captionAr = typeof obj.captionAr === 'string' ? obj.captionAr.trim() : ''
  if (!captionEn || !captionAr) {
    throw new Error('The model returned only one language. Try again.')
  }

  const hashtags = Array.isArray(obj.hashtags)
    ? obj.hashtags
        .filter((h): h is string => typeof h === 'string')
        .map((h) => (h.startsWith('#') ? h : `#${h}`))
        .slice(0, 6)
    : []

  return { captionEn, captionAr, hashtags }
}
