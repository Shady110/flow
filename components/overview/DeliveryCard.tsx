import { getTranslations } from 'next-intl/server'
import { PIPELINE_COLUMNS } from '@/lib/overview'
import type { CeoOverview } from '@/lib/db/overview-queries'
import { Panel } from '@/components/dashboard/Panel'
import { DonutChart } from '@/components/dashboard/viz'
import { VIZ } from '@/components/dashboard/palette'
import { AnimatedCircularProgressBar } from '@/components/ds/animated-circular-progress-bar'
import { PipelineFlow } from '@/components/overview/PipelineFlow'
import { RankBars } from '@/components/overview/RankBars'

/** Where accounts are, how long each stage takes, what is open, and how healthy the live accounts are. */
export async function DeliveryCard({ data }: { data: CeoOverview }) {
  const [t, tf] = await Promise.all([getTranslations('internal.overview'), getTranslations('internal.flow')])
  const { kpis, trends, pipeline } = data
  const healthy = kpis.accountsLive > 0 ? Math.round(((kpis.accountsLive - Math.min(kpis.accountsAtRisk, kpis.accountsLive)) / kpis.accountsLive) * 100) : 100
  const tone: Record<string, string> = { urgent: VIZ.danger, high: VIZ.warn, normal: VIZ.ink, low: VIZ.leaf }
  const tickets = trends.ticketPriority.map((p) => ({ label: t(`priority.${p.key}`), value: p.count, color: tone[p.key] }))

  return (
    <Panel title={t('deliveryTitle')} description={t('deliveryDescription')}>
      <PipelineFlow
        label={t('flowLabel')}
        steps={PIPELINE_COLUMNS.map((c) => ({ key: c, label: tf(`stage.${c}`), count: pipeline[c] }))}
      />
      <div className="mt-2 grid gap-6 lg:grid-cols-3">
        <div>
          <h3 className="mb-3 font-display text-base font-bold">{t('dwellTitle')}</h3>
          <RankBars
            empty={t('dwellEmpty')}
            rows={PIPELINE_COLUMNS.filter((c) => trends.dwell[c] !== undefined).map((c) => ({
              label: tf(`stage.${c}`),
              value: trends.dwell[c],
              display: t('days', { count: trends.dwell[c] }),
              tone: 'green' as const,
            }))}
          />
        </div>
        <div>
          <h3 className="mb-3 font-display text-base font-bold">{t('ticketsTitle')}</h3>
          <DonutChart data={tickets} centerLabel={t('ticketsCenter')} empty={t('ticketsEmpty')} />
        </div>
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          {kpis.accountsLive === 0 ? (
            <p className="rounded-xl bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">{t('noLiveAccounts')}</p>
          ) : (
          <AnimatedCircularProgressBar value={healthy} gaugePrimaryColor={healthy < 70 ? VIZ.warn : VIZ.ink} gaugeSecondaryColor={VIZ.muted} className="size-28 text-xl" />
          )}
          {kpis.accountsLive > 0 && <p className="text-xs text-muted-foreground">{t('healthRing')}</p>}
        </div>
      </div>
    </Panel>
  )
}
