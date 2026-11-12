import { getLocale, getTranslations } from 'next-intl/server'
import { Briefcase, LifeBuoy, ShieldAlert } from 'lucide-react'
import { requirePermission } from '@/lib/auth/session'
import { getCeoOverview } from '@/lib/db/overview-queries'
import { canOpenHref } from '@/lib/access'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { AttentionFeed } from '@/components/overview/AttentionFeed'
import { DeliveryCard } from '@/components/overview/DeliveryCard'
import { WorkloadBars } from '@/components/overview/Panels'

/** Account Management dashboard, read only: same look as the CEO home, limited to what Accounts works. */
export default async function AccountsInsightsPage() {
  const viewer = await requirePermission('insights.accounts')
  const locale = await getLocale()
  const [t, to, data] = await Promise.all([getTranslations('internal.insights'), getTranslations('internal.overview'), getCeoOverview(locale)])
  const k = data.kpis

  return (
    <div className="space-y-6">
      <PageHeader title={t('accountsTitle')} description={t('accountsDescription')} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <div className="col-span-2">
          <StatCard variant="hero" icon={Briefcase} label={t('live')} value={k.accountsLive} href="/accounts" />
        </div>
        <StatCard icon={ShieldAlert} label={t('atRisk')} value={k.accountsAtRisk} tone={k.accountsAtRisk ? 'danger' : 'default'} />
        <StatCard icon={LifeBuoy} label={t('openTickets')} value={k.openTickets} tone={k.urgentTickets ? 'danger' : 'default'} chip={k.urgentTickets ? { text: `${k.urgentTickets} ${t('urgentTickets').toLowerCase()}`, tone: 'bad' } : undefined} href="/accounts/tickets" />
        <div className="col-span-2 xl:col-span-4">
          <DeliveryCard data={data} />
        </div>
        <div className="col-span-2">
          <AttentionFeed items={data.attention.filter((a) => a.kind === 'ticket_urgent' || a.kind === 'ticket_unassigned')} clientNames={data.clientNames} canOpen={(h) => canOpenHref(viewer.permissions, h)} />
        </div>
        <div className="col-span-2">
          <WorkloadBars rows={data.workload} field="accounts" title={to('accountsByOwner')} />
        </div>
      </div>
    </div>
  )
}
