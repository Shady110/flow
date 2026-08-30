import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Anonymous visitor beacon. Writes to `site_visitors`, never to `leads` — see
 * the header of supabase/migrations/0011_site_visitors.sql for why.
 *
 * Public and unauthenticated like /api/contact, so it uses the service-role
 * client (no RLS policy grants insert) and is rate limited. It stores no name,
 * email or phone: identity only ever arrives later, when the visitor fills in
 * the contact form or gives the chatbot their details.
 */

export const runtime = 'nodejs'

export const VISITOR_COOKIE = 'flow_vid'
const MAX_ACTIVITY = 50
const RATE_LIMIT = { max: 60, windowMs: 10 * 60 * 1000 }

const BodySchema = z.object({
  type: z.enum(['page_view', 'chat_opened', 'package_configured']),
  path: z.string().max(300).optional(),
  serviceKey: z.string().max(60).optional(),
  monthly: z.number().finite().optional(),
  oneTime: z.number().finite().optional(),
  referrer: z.string().max(500).optional(),
  locale: z.string().max(10).optional(),
  search: z.string().max(500).optional(),
})

/** ponytail: per-instance, same ceiling as /api/chat. Move it out if abused. */
const hits = new Map<string, number[]>()
function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < RATE_LIMIT.windowMs)) hits.delete(k)
  }
  return recent.length > RATE_LIMIT.max
}

const utm = (search: string | undefined, key: string): string | null => {
  if (!search) return null
  try {
    return new URLSearchParams(search).get(key)
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (rateLimited(ip)) return new NextResponse(null, { status: 429 })

  const parsed = BodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return new NextResponse(null, { status: 400 })
  const body = parsed.data

  // The cookie is the whole identity. A visitor arriving without one is new.
  const existing = req.cookies.get(VISITOR_COOKIE)?.value
  const visitorId = existing && /^[0-9a-f-]{36}$/i.test(existing) ? existing : crypto.randomUUID()

  const res = new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })
  if (visitorId !== existing) {
    res.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  // Best-effort: a tracking failure must never be visible to the visitor, and
  // must not break before migration 0011 has been applied by hand.
  try {
    const admin = createAdminClient()
    const { data: row } = await admin
      .from('site_visitors')
      .select('id, page_views, activity')
      .eq('visitor_id', visitorId)
      .maybeSingle()

    const entry = { t: new Date().toISOString(), ...body, referrer: undefined, search: undefined }
    const activity = [...((row?.activity as unknown[]) ?? []), entry].slice(-MAX_ACTIVITY)

    if (row) {
      await admin
        .from('site_visitors')
        .update({
          last_seen: new Date().toISOString(),
          page_views: (row.page_views ?? 0) + (body.type === 'page_view' ? 1 : 0),
          activity,
          locale: body.locale ?? null,
        })
        .eq('id', row.id)
    } else {
      await admin.from('site_visitors').insert({
        visitor_id: visitorId,
        page_views: body.type === 'page_view' ? 1 : 0,
        // First-touch attribution: only ever set on the row that did not exist.
        referrer: body.referrer ?? null,
        utm_source: utm(body.search, 'utm_source'),
        utm_medium: utm(body.search, 'utm_medium'),
        utm_campaign: utm(body.search, 'utm_campaign'),
        // Identifies the individual post inside a campaign — see 0012.
        utm_content: utm(body.search, 'utm_content'),
        locale: body.locale ?? null,
        user_agent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
        activity,
      })
    }
  } catch (err) {
    console.error('[track] could not record visit:', err)
  }

  return res
}
