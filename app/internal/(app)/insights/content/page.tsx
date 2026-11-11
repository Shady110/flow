import { getLocale, getTranslations } from 'next-intl/server'
import { Camera, FileWarning, Hourglass } from 'lucide-react'
import { requirePermission } from '@/lib/auth/session'
import { getCeoOverview } from '@/lib/db/overview-queries'
import { canOpenHref } from '@/lib/access'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { AttentionFeed } from '@/components/overview/AttentionFeed'
import { DwellPanel, PipelinePanel, WorkloadBars } from '@/components/overview/Panels'

/** Content dashboard, read only: same look as the CEO home, limited to what Content works. */
export default async function ContentInsightsPage() {
  const viewer = await requirePermission('insights.content')
  const locale = await getLocale()
  const [t, to, data] = await Promise.all([getTranslations('internal.insights'), getTranslations('internal.overview'), getCeoOverview(locale)])
  const stuck = data.attention.filter((a) => a.kind === 'listing_stuck')
  const missing = stuck.reduce((n, a) => n + (Number(a.detail) || 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader title={t('contentTitle')} description={t('contentDescription')} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <div className="col-span-2">
          <StatCard variant="hero" icon={Camera} label={t('inListing')} value={data.pipeline.listing} href="/content" />
        </div>
        <StatCard icon={Hourglass} label={to('stuckListings')} value={stuck.length} tone={stuck.length ? 'warning' : 'default'} />
        <StatCard icon={FileWarning} label={to('missingFiles')} value={missing} tone={missing ? 'warning' : 'default'} />
        <div className="col-span-2 xl:col-span-4">
          <PipelinePanel counts={data.pipeline} stages={['platform_creation', 'listing', 'pushing', 'managing']} />
        </div>
        <div className="col-span-2">
          <DwellPanel dwell={data.trends.dwell} stages={['platform_creation', 'listing']} />
        </div>
        <div className="col-span-2">
          <AttentionFeed items={stuck} clientNames={data.clientNames} canOpen={(h) => canOpenHref(viewer.permissions, h)} />
        </div>
        <div className="col-span-2 xl:col-span-4">
          <WorkloadBars rows={data.workload} field="tasks" title={to('queueTitle')} />
        </div>
      </div>
    </div>
  )
}
