import 'server-only'
import { createClient } from '@/lib/supabase/server'

export interface VisitorRow {
  id: string
  visitor_id: string
  first_seen: string
  last_seen: string
  page_views: number
  referrer: string | null
  utm_source: string | null
  locale: string | null
  lead_id: string | null
  activity: { t?: string; type?: string; path?: string; serviceKey?: string }[]
  leads: { id: string; name: string; status: string } | null
}

/**
 * Everyone who accepted cookies, newest activity first.
 *
 * Most of these are anonymous and will stay that way — the point is not a
 * contact list, it is seeing which pages and packages are pulling interest, and
 * how many of those sessions ever turn into a named lead.
 *
 * Returns an empty list rather than throwing when migration 0011 has not been
 * applied yet, so the page renders instead of erroring.
 */
export async function getVisitors(limit = 200): Promise<VisitorRow[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_visitors')
      .select(
        'id, visitor_id, first_seen, last_seen, page_views, referrer, utm_source, locale, lead_id, activity, leads(id, name, status)',
      )
      .order('last_seen', { ascending: false })
      .limit(limit)
    return (data as unknown as VisitorRow[] | null) ?? []
  } catch {
    return []
  }
}

export interface VisitorJourney {
  first_seen: string
  last_seen: string
  page_views: number
  referrer: string | null
  utm_source: string | null
  activity: { t?: string; type?: string; path?: string; serviceKey?: string; monthly?: number }[]
}

/**
 * The anonymous browsing session behind a lead, if one was linked. Returns null
 * when the visitor rejected cookies, arrived on a different device, or
 * migration 0011 has not been applied yet — none of which is an error.
 */
export async function getLeadJourney(leadId: string): Promise<VisitorJourney | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_visitors')
      .select('first_seen, last_seen, page_views, referrer, utm_source, activity')
      .eq('lead_id', leadId)
      .maybeSingle()
    return (data as VisitorJourney | null) ?? null
  } catch {
    return null
  }
}
