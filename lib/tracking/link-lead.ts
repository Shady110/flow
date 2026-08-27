import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { VISITOR_COOKIE } from '@/app/api/track/route'

/**
 * Attach the anonymous browsing session to a lead, and hand the sales team a
 * one-line summary of what the person actually did before they got in touch.
 *
 * This is the only place a `site_visitors` row becomes a person. Everything
 * before it is anonymous by construction — see migration 0011.
 *
 * Best-effort throughout: a lead must never fail to save because tracking is
 * unavailable, the table has not been migrated yet, or the visitor rejected
 * cookies (in which case there is simply no row to find).
 */
export async function linkVisitorToLead(
  visitorId: string | undefined,
  leadId: string,
): Promise<string | null> {
  if (!visitorId) return null
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('site_visitors')
      .select('id, page_views, first_seen, referrer, utm_source, activity')
      .eq('visitor_id', visitorId)
      .maybeSingle()
    if (!data) return null

    await admin.from('site_visitors').update({ lead_id: leadId }).eq('id', data.id)

    const activity = (data.activity as { type?: string; serviceKey?: string }[]) ?? []
    const configured = activity.filter((a) => a?.type === 'package_configured').pop()
    return [
      `Visited ${data.page_views ?? 0} page(s) since ${String(data.first_seen).slice(0, 10)}`,
      data.referrer ? `via ${data.referrer}` : null,
      data.utm_source ? `utm_source=${data.utm_source}` : null,
      configured?.serviceKey ? `configured a "${configured.serviceKey}" package` : null,
      activity.some((a) => a?.type === 'chat_opened') ? 'opened the chat' : null,
    ]
      .filter(Boolean)
      .join(' · ')
  } catch (err) {
    console.error('[track] could not link visitor to lead:', err)
    return null
  }
}

export { VISITOR_COOKIE }
