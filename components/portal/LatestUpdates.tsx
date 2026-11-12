import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { Sparkles } from 'lucide-react'
import { relativeTime } from '@/lib/overview'
import type { StageEvent } from '@/lib/types'

/** The team's recent moves on the client's account, in friendly sentences. A plain list — never hidden behind an animation. */
export async function LatestUpdates({
  events,
  platformNames,
}: {
  events: StageEvent[]
  platformNames: Record<string, string>
}) {
  const [t, to, locale] = await Promise.all([
    getTranslations('portal.home'),
    getTranslations('portal.overview'),
    getLocale(),
  ])
  return (
    <section className="rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-xs)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold tracking-tight">{t('updatesTitle')}</h2>
        <Link href="/tasks" className="min-h-11 content-center text-sm font-medium text-[var(--brand-ink)] hover:underline">
          {t('seeWork')}
        </Link>
      </div>
      {events.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">{t('updatesEmpty')}</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {events.map((e) => (
            <li key={e.id} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand-ink)]">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-snug">
                  {e.platform_id && platformNames[e.platform_id]
                    ? t('updatePlatform', { platform: platformNames[e.platform_id], stage: to(`stage.${e.to_stage}`) })
                    : t('updateClient', { stage: to(`stage.${e.to_stage}`) })}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{relativeTime(e.created_at, locale)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
