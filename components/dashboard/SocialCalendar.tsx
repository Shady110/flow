'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ds/card'
import { Badge } from '@/components/ds/badge'
import { cn } from '@/lib/utils'
import type { SocialPost, SocialCampaign, SocialPostStatus, SocialPlatform } from '@/lib/types'
import { Instagram, Facebook, Linkedin, Users, ImageOff } from 'lucide-react'

const PLATFORM_ICON = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
} as const satisfies Record<SocialPlatform, typeof Instagram>

/**
 * Status colour is semantic, not decorative: `failed` and `needs_design` are
 * the two states someone has to act on, so they are the two that carry weight.
 */
const STATUS_TONE: Record<SocialPostStatus, string> = {
  idea: 'bg-muted text-muted-foreground',
  draft: 'bg-muted text-muted-foreground',
  needs_design: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  approved: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200',
  scheduled: 'bg-primary/10 text-primary',
  published: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
  failed: 'bg-destructive/10 text-destructive',
}

/**
 * The plan, grouped by day.
 *
 * A month grid was the obvious choice and the wrong one: at nine posts a week
 * across three platforms the cells are too small to show a hook, so the grid
 * becomes a set of dots you have to click to read. A dated list shows the
 * actual content and still reads as a calendar because the dates are the
 * spine.
 */
export function SocialCalendar({
  posts,
  campaigns,
  leadCounts,
  canPublish,
  empty,
}: {
  posts: SocialPost[]
  campaigns: SocialCampaign[]
  leadCounts: Record<string, number>
  canPublish: boolean
  empty: boolean
}) {
  const t = useTranslations('internal.social')
  const campaignName = new Map(campaigns.map((c) => [c.id, c.name]))

  if (posts.length === 0) {
    return (
      <Card className="p-10 text-center text-sm text-muted-foreground">
        {empty ? t('noPostsYet') : t('noMatches')}
      </Card>
    )
  }

  // Undated ideas are a backlog, not a schedule — they group under their own
  // heading at the end rather than being given a fake date.
  const dated = posts.filter((p) => p.scheduled_at)
  const undated = posts.filter((p) => !p.scheduled_at)

  const byDay = new Map<string, SocialPost[]>()
  for (const p of dated) {
    const day = p.scheduled_at!.slice(0, 10)
    const list = byDay.get(day) ?? []
    list.push(p)
    byDay.set(day, list)
  }

  return (
    <div className="space-y-6">
      {[...byDay.entries()].map(([day, dayPosts]) => (
        <div key={day} className="space-y-2">
          <DayHeading day={day} />
          <div className="space-y-2">
            {dayPosts.map((p) => (
              <PostRow
                key={p.id}
                post={p}
                campaign={p.campaign_id ? campaignName.get(p.campaign_id) : undefined}
                leads={leadCounts[p.id] ?? 0}
                canPublish={canPublish}
              />
            ))}
          </div>
        </div>
      ))}

      {undated.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('backlog')}
          </h3>
          <div className="space-y-2">
            {undated.map((p) => (
              <PostRow
                key={p.id}
                post={p}
                campaign={p.campaign_id ? campaignName.get(p.campaign_id) : undefined}
                leads={leadCounts[p.id] ?? 0}
                canPublish={canPublish}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DayHeading({ day }: { day: string }) {
  const date = new Date(`${day}T00:00:00`)
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' })
  const label = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  // Egypt's weekend is Fri–Sat; marking it explains an otherwise odd-looking
  // gap in the rhythm rather than leaving it as a mystery.
  const weekend = date.getDay() === 5 || date.getDay() === 6

  return (
    <div className="flex items-center gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {weekday} {label}
      </h3>
      {weekend && (
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
          weekend
        </span>
      )}
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

function PostRow({
  post,
  campaign,
  leads,
  canPublish,
}: {
  post: SocialPost
  campaign?: string
  leads: number
  canPublish: boolean
}) {
  const t = useTranslations('internal.social')
  const Icon = PLATFORM_ICON[post.platform]
  const written = Boolean(post.caption_en && post.caption_ar)

  return (
    <Link
      href={`/social/${post.id}`}
      className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{post.hook}</span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="text-[10px]">{t(`pillarName.${post.pillar}`)}</Badge>
          <Badge variant="outline" className="text-[10px]">{t(`formatName.${post.format}`)}</Badge>
          {campaign && <Badge variant="outline" className="text-[10px]">{campaign}</Badge>}
          {/* Two things a planner needs at a glance and would otherwise have to
              open the post to discover. */}
          {!written && (
            <span className="text-[10px] text-muted-foreground">{t('copyMissing')}</span>
          )}
          {!post.media_path && post.format !== 'text' && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <ImageOff className="h-3 w-3" />
              {t('designMissing')}
            </span>
          )}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-2">
        {leads > 0 && (
          <span
            className="flex items-center gap-1 text-xs text-muted-foreground"
            title={t('leadsFromPost')}
          >
            <Users className="h-3 w-3" />
            {leads}
          </span>
        )}
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold',
            STATUS_TONE[post.status],
          )}
        >
          {t(`statusName.${post.status}`)}
        </span>
        {post.status === 'scheduled' && !canPublish && (
          <span className="text-[10px] text-muted-foreground">{t('readOnly')}</span>
        )}
      </span>
    </Link>
  )
}
