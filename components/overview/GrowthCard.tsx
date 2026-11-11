import { getTranslations } from 'next-intl/server'
import type { CeoOverview } from '@/lib/db/overview-queries'
import { Panel } from '@/components/dashboard/Panel'
import { ColumnChart } from '@/components/dashboard/Columns'
import { VIZ } from '@/components/dashboard/palette'
import { AnimatedCircularProgressBar } from '@/components/ds/animated-circular-progress-bar'
import { FunnelSteps } from '@/components/overview/FunnelSteps'

/** Leads becoming clients: the funnel with its win-rate ring, and arrivals per month. */
export async function GrowthCard({ trends }: { trends: CeoOverview['trends'] }) {
  const t = await getTranslations('internal.overview')
  const { funnel, newClients, newLeads } = trends
  const months = newLeads.map((m, i) => ({ name: m.name, Leads: m.count, Clients: newClients[i]?.count ?? 0 }))
  return (
    <Panel title={t('growthTitle')} description={t('growthDescription')} className="h-full">
      <div className="grid gap-6 sm:grid-cols-[1fr_120px] sm:items-center">
        <FunnelSteps empty={t('growthEmpty')} steps={funnel.steps.map((s) => ({ label: t(`funnel.${s.key}`), count: s.count }))} />
        <div className="flex flex-col items-center gap-2 text-center">
          <AnimatedCircularProgressBar value={funnel.winRate ?? 0} gaugePrimaryColor={VIZ.ink} gaugeSecondaryColor={VIZ.muted} className="size-24 text-lg" />
          <p className="text-xs text-muted-foreground">{t('winRateLabel')}</p>
        </div>
      </div>
      <div className="mt-5">
        <p className="mb-1 text-xs text-muted-foreground">{t('newVsLeads')}</p>
        <ColumnChart
          data={months}
          label={t('newVsLeads')}
          empty={t('growthEmpty')}
          height={190}
          series={[
            { key: 'Leads', color: VIZ.mid, soft: VIZ.mint, label: t('seriesLeads') },
            { key: 'Clients', color: VIZ.ink, soft: VIZ.leaf, label: t('seriesClients') },
          ]}
        />
      </div>
    </Panel>
  )
}
