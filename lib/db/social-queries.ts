import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type {
  SocialPost,
  SocialCampaign,
  SocialAccount,
  SocialPlatform,
  SocialPostStatus,
} from '@/lib/types'

export interface SocialFilters {
  platform?: SocialPlatform
  status?: SocialPostStatus
  campaignId?: string
  /** Inclusive ISO date bounds, used by the month view. */
  from?: string
  to?: string
}

/**
 * Posts in calendar order — earliest first, unlike every other list in the
 * dashboard. A content calendar is read forwards: what is coming, not what
 * happened. Undated ideas sort last so they sit in a backlog rather than
 * interleaving with scheduled work.
 */
export async function getSocialPosts(filters: SocialFilters = {}): Promise<SocialPost[]> {
  const supabase = await createClient()
  let query = supabase
    .from('social_posts')
    .select('*')
    .order('scheduled_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  if (filters.platform) query = query.eq('platform', filters.platform)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.campaignId) query = query.eq('campaign_id', filters.campaignId)
  if (filters.from) query = query.gte('scheduled_at', filters.from)
  if (filters.to) query = query.lte('scheduled_at', filters.to)

  const { data } = await query
  return (data as SocialPost[]) ?? []
}

export async function getSocialPost(id: string): Promise<SocialPost | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('social_posts').select('*').eq('id', id).maybeSingle()
  return (data as SocialPost) ?? null
}

export async function getSocialCampaigns(): Promise<SocialCampaign[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('social_campaigns')
    .select('*')
    .order('starts_at', { ascending: true })
  return (data as SocialCampaign[]) ?? []
}

/** Warn this far ahead, so a lapse is fixable during a working week. */
const TOKEN_WARN_DAYS = 7

export interface ExpiringAccount {
  id: string
  displayName: string
  expiresAt: string
  expired: boolean
}

/**
 * Accounts whose access token has lapsed or is about to.
 *
 * The clock read belongs here rather than in the component: "which tokens need
 * attention" is a question about data, and reading the time while rendering is
 * both impure and a source of server/client disagreement.
 *
 * This is the one failure in publishing that is completely silent — posts stop
 * going out and nothing says so — which is why it exists before publishing does.
 */
export async function getExpiringAccounts(): Promise<ExpiringAccount[]> {
  const accounts = await getSocialAccounts()
  const now = Date.now()
  const horizon = now + TOKEN_WARN_DAYS * 24 * 60 * 60 * 1000

  return accounts
    .filter((a) => a.is_active && a.token_expires_at)
    .filter((a) => new Date(a.token_expires_at!).getTime() < horizon)
    .map((a) => ({
      id: a.id,
      displayName: a.display_name,
      expiresAt: a.token_expires_at!,
      expired: new Date(a.token_expires_at!).getTime() < now,
    }))
}

export async function getSocialAccounts(): Promise<SocialAccount[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('social_accounts')
    .select('*')
    .order('platform', { ascending: true })
  return (data as SocialAccount[]) ?? []
}

/**
 * Which posts drove which leads.
 *
 * No new tracking: posts carry `utm_content`, the existing visitor tracker
 * already records `utm_content` per session, and a visitor is promoted to a
 * lead by `site_visitors.lead_id`. So attribution is a join over data that is
 * already being collected.
 *
 * Returns a count per post rather than the leads themselves — the calendar
 * needs a number, and the lead detail already has its own page.
 */
export async function getLeadCountsByPost(): Promise<Record<string, number>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('site_visitors')
    .select('utm_content')
    .not('lead_id', 'is', null)
    .not('utm_content', 'is', null)

  // Attribution is a nice-to-have on a calendar page; a failure here must not
  // take the page down with it.
  if (error || !data) return {}

  const counts: Record<string, number> = {}
  for (const row of data as { utm_content: string | null }[]) {
    if (!row.utm_content) continue
    counts[row.utm_content] = (counts[row.utm_content] ?? 0) + 1
  }
  return counts
}
