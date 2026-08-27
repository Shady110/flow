import 'server-only'
import { createClient } from '@/lib/supabase/server'

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
