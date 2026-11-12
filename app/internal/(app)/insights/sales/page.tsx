import { getLocale, getTranslations } from 'next-intl/server'
import { Funnel, Trophy } from 'lucide-react'
import { requirePermission } from '@/lib/auth/session'
import { getCeoOverview } from '@/lib/db/overview-queries'
import { changeVsLast } from '@/lib/overview-trends'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { CapRingTile } from '@/components/overview/CapRingTile'
import { GrowthCard } from '@/components/overview/GrowthCard'
import { LeadSourcesCard } from '@/components/overview/LeadSourcesCard'
import { PipelinePanel, WorkloadBars } from '@/components/overview/Panels'

/** Sales dashboard, read only: same look as the CEO home, limited to what Sales works. */
export default async function SalesInsightsPage() {
  await requirePermission('insights.sales')
  const locale = await getLocale()
  const [t, data] = await Promise.all([getTranslations('internal.insights'), getCeoOverview(locale)])
  const to = await getTranslations('internal.overview')
  const { trends, kpis } = data
  const steps = trends.funnel.steps
  const won = steps[steps.length - 1]?.count ?? 0
  const total = steps[0]?.count ?? 0
  const open = total - won - trends.funnel.lost
  const series = trends.newLeads.map((m) => m.count)
  const { delta, pct } = changeVsLast(series)
  const capFull = kpis.cap.won >= kpis.cap.cap

  return (
    <div className="space-y-6">
      <PageHeader title={t('salesTitle')} description={t('salesDescription')} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <div className="col-span-2">
          <StatCard
            variant="hero"
            icon={Funnel}
            label={t('openLeads')}
            value={Math.max(0, open)}
            trend={series}
            trendLabel={to('trendLeads')}
            chip={pct === null ? undefined : { text: to('vsLastMonth', { pct: `${delta >= 0 ? '+' : ''}${pct}` }), tone: delta >= 0 ? 'good' : 'bad' }}
            href="/leads"
          />
        </div>
        <CapRingTile
          label={t('cap')}
          won={kpis.cap.won}
          cap={kpis.cap.cap}
          full={capFull}
          note={capFull ? t('capFull') : t('capLeft', { count: kpis.cap.cap - kpis.cap.won })}
        />
        <StatCard icon={Trophy} label={t('won')} value={won} chip={trends.funnel.winRate === null ? undefined : { text: `${t('winRate')} ${trends.funnel.winRate}%`, tone: 'good' }} />
        <div className="col-span-2">
          <GrowthCard trends={trends} />
        </div>
        <div className="col-span-2">
          <LeadSourcesCard sources={trends.sources} className="h-full" />
        </div>
        <div className="col-span-2 xl:col-span-4">
          <PipelinePanel counts={data.pipeline} stages={['lead', 'group_created', 'paperwork', 'platform_creation']} />
        </div>
        <div className="col-span-2 xl:col-span-4">
          <WorkloadBars rows={data.workload} field="leads" title={to('leadsByOwner')} />
        </div>
      </div>
    </div>
  )
}
