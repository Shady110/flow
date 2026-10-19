import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { relativeTime } from '@/lib/overview'
import type { CeoOverview } from '@/lib/db/overview-queries'
import { Panel } from '@/components/dashboard/Panel'
import { EmptyState } from '@/components/dashboard/EmptyState'

/** The latest stage moves across the company, newest first. */
export async function ActivityFeed({ events }: { events: CeoOverview['events'] }) {
  const [t, tf, tm, locale] = await Promise.all([
    getTranslations('internal.overview'),
    getTranslations('internal.flow'),
    getTranslations('internal.marketplace'),
    getLocale(),
  ])
  return (
    <Panel title={t('activityTitle')} description={t('activityDescription')} className="h-full">
      {events.length === 0 ? (
        <EmptyState text={t('activityEmpty')} />
      ) : (
        <ul className="space-y-1">
          {events.map((e) => (
            <li key={e.id}>
              <Link href={`/clients/${e.client_id}`} className="flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-muted/60">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-flow-green">
                  <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {e.client_name}
                    {e.platform ? ` · ${tm(e.platform)}` : ''}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {e.from_stage ? `${tf(`stage.${e.from_stage}`)} → ` : ''}
                    {tf(`stage.${e.to_stage}`)}
                    {e.actor_name ? ` · ${e.actor_name}` : ''}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(e.created_at, locale)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
