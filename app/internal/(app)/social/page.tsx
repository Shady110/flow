import { getTranslations } from 'next-intl/server'
import { requirePermission, getCurrentUser } from '@/lib/auth/session'
import {
  getSocialPosts,
  getSocialCampaigns,
  getExpiringAccounts,
  getLeadCountsByPost,
} from '@/lib/db/social-queries'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { SocialFilters } from '@/components/dashboard/SocialFilters'
import { SocialCalendar } from '@/components/dashboard/SocialCalendar'
import { NewSocialPostDialog } from '@/components/dashboard/NewSocialPostDialog'
import { TokenWarning } from '@/components/dashboard/TokenWarning'
import { SOCIAL_PLATFORMS, SOCIAL_POST_STATUSES, SOCIAL_OPEN_STATUSES } from '@/lib/constants'
import type { SocialPlatform, SocialPostStatus } from '@/lib/types'
import { CalendarDays, PenLine, Send, Users } from 'lucide-react'

export default async function SocialPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; status?: string; campaign?: string }>
}) {
  await requirePermission('social.view')
  const sp = await searchParams

  const platform = SOCIAL_PLATFORMS.includes(sp.platform as SocialPlatform)
    ? (sp.platform as SocialPlatform)
    : undefined
  const status = SOCIAL_POST_STATUSES.includes(sp.status as SocialPostStatus)
    ? (sp.status as SocialPostStatus)
    : undefined

  const [posts, allPosts, campaigns, expiringAccounts, leadCounts, user, t] = await Promise.all([
    getSocialPosts({ platform, status, campaignId: sp.campaign }),
    // Unfiltered, so the stat cards keep describing the whole plan rather than
    // the current filter.
    getSocialPosts(),
    getSocialCampaigns(),
    getExpiringAccounts(),
    getLeadCountsByPost(),
    getCurrentUser(),
    getTranslations('internal.social'),
  ])

  const canCreate = !!user?.permissions.has('social.create')
  const canPublish = !!user?.permissions.has('social.publish')

  const open = allPosts.filter((p) => SOCIAL_OPEN_STATUSES.includes(p.status)).length
  const scheduled = allPosts.filter((p) => p.status === 'scheduled').length
  const published = allPosts.filter((p) => p.status === 'published').length
  // Attribution is keyed on utm_content, which is the post id.
  const attributed = allPosts.reduce((n, p) => n + (leadCounts[p.id] ?? 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={canCreate ? <NewSocialPostDialog campaigns={campaigns} /> : undefined}
      />

      {/* Publishing is Phase 2, but a lapsed token is silent and this is where
          someone would notice. Renders nothing until an account exists. */}
      <TokenWarning accounts={expiringAccounts} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('statOpen')} value={open} icon={PenLine} />
        <StatCard label={t('statScheduled')} value={scheduled} icon={CalendarDays} />
        <StatCard label={t('statPublished')} value={published} icon={Send} tone={published ? 'success' : 'default'} />
        <StatCard label={t('statLeads')} value={attributed} icon={Users} tone={attributed ? 'success' : 'default'} />
      </div>

      <SocialFilters campaigns={campaigns} />

      <SocialCalendar
        posts={posts}
        campaigns={campaigns}
        leadCounts={leadCounts}
        canPublish={canPublish}
        empty={allPosts.length === 0}
      />
    </div>
  )
}
