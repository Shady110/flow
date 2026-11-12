import { getTranslations } from 'next-intl/server'
import type { CeoOverview } from '@/lib/db/overview-queries'
import { Panel } from '@/components/dashboard/Panel'
import { DonutChart } from '@/components/dashboard/viz'

/** Where leads come from, and which sources actually turn into clients. */
export async function LeadSourcesCard({ sources, className }: { sources: CeoOverview['trends']['sources']; className?: string }) {
  const t = await getTranslations('internal.overview')
  const label = (key: string) => (t.has(`sources.${key}`) ? t(`sources.${key}`) : key.charAt(0).toUpperCase() + key.slice(1))
  const total = sources.reduce((s, r) => s + r.count, 0)
  return (
    <Panel title={t('sourcesTitle')} description={t('sourcesDescription')} className={className}>
      <DonutChart centerLabel={t('sourcesCenter')} empty={t('sourcesEmpty')} data={sources.map((s) => ({ label: label(s.key), value: s.count }))} />
      {total > 0 && (
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {sources.slice(0, 4).map((s) => (
            <li key={s.key} className="flex items-center justify-between gap-3 rounded-2xl bg-muted/60 px-3.5 py-2.5 text-sm">
              <span className="truncate text-muted-foreground">{label(s.key)}</span>
              <span className="shrink-0 text-xs">
                <bdi dir="ltr" className="font-display font-bold">{s.won}</bdi>
                <span className="text-muted-foreground"> {t('sourcesWon')}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
