import { Suspense } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import { Users } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/session'
import { getCeoOverview } from '@/lib/db/overview-queries'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { AttentionFeed } from '@/components/overview/AttentionFeed'
import { MoneyPanel } from '@/components/overview/MoneyPanel'
import { RevenueHero } from '@/components/overview/RevenueHero'
import { ClientsTable } from '@/components/overview/ClientsTable'
import { GrowthCard } from '@/components/overview/GrowthCard'
import { DeliveryCard } from '@/components/overview/DeliveryCard'
import { LeadSourcesCard } from '@/components/overview/LeadSourcesCard'
import { ActivityFeed } from '@/components/overview/ActivityFeed'
import { canOpenHref } from '@/lib/access'
import { formatMoney } from '@/lib/money'
import { Skeleton } from '@/components/ds/skeleton'
import type { CurrentUser } from '@/lib/types'

export default async function OverviewPage() {
  const viewer = await getCurrentUser()
  const [t, locale] = await Promise.all([getTranslations('internal.overview'), getLocale()])
  const first = (viewer?.full_name ?? '').trim().split(/\s+/)[0]
  const today = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

  return (
    <div className="space-y-6">
      <PageHeader
        title={first ? t('greeting', { name: first }) : t('title')}
        description={`${today} · ${t('description')}`}
      />
      {/* The header paints at once; the numbers stream in behind it. */}
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-busy="true">
            <Skeleton className="col-span-2 h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
          </div>
        }
      >
        <OverviewBody viewer={viewer} />
      </Suspense>
    </div>
  )
}

async function OverviewBody({ viewer }: { viewer: CurrentUser | null }) {
  const locale = await getLocale()
  const [data, t] = await Promise.all([getCeoOverview(locale), getTranslations('internal.overview')])
  const { kpis, trends, finance } = data
  const canSeeMoney = !!viewer?.permissions.has('finance.view')
  const lateClients = trends.clients.filter((c) => c.status === 'late').length
  const owedLate = trends.aging.late1to7 + trends.aging.late8to14 + trends.aging.late15plus
  const fmt = (n: number) => formatMoney(n, finance.currency, 0)
  const winRate = trends.funnel.winRate
  const leadsTotal = trends.funnel.steps[0]?.count ?? 0

  // Command center: revenue and a stack of key numbers, then every client by name, then the detail rows.
  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {canSeeMoney && <RevenueHero finance={finance} />}
        <div className={canSeeMoney ? 'grid gap-3 sm:gap-4' : 'grid gap-3 sm:grid-cols-3 sm:gap-4 lg:col-span-2'}>
          {canSeeMoney && (
            <StatCard
              size="sm"
              label={t('outstanding')}
              value={fmt(finance.outstanding)}
              tone={owedLate > 0 ? 'warning' : 'default'}
              hint={lateClients > 0 ? t('outstandingSub', { count: lateClients }) : t('outstandingSubNone')}
              href="/finance"
            />
          )}
          <StatCard
            size="sm"
            icon={Users}
            label={t('kpiActive')}
            value={kpis.activeClients}
            hint={t('activeSub', { won: kpis.cap.won, cap: kpis.cap.cap })}
            trend={trends.newClients.map((m) => m.count)}
            trendLabel={t('trendClients')}
            href="/insights/accounts"
          />
          <StatCard
            size="sm"
            label={t('winRateLabel')}
            value={winRate === null ? '—' : `${winRate}%`}
            hint={t('winSub', { leads: leadsTotal })}
            href="/insights/sales"
          />
        </div>
      </div>

      <ClientsTable rows={trends.clients} currency={finance.currency} />

      {canSeeMoney && <MoneyPanel finance={finance} budget={data.budget} aging={trends.aging} />}

      <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
        <GrowthCard trends={trends} />
        <LeadSourcesCard sources={trends.sources} className="h-full" />
      </div>
      <DeliveryCard data={data} />
      <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
        <AttentionFeed items={data.attention} clientNames={data.clientNames} canOpen={(h) => canOpenHref(viewer?.permissions ?? new Set(), h)} />
        <ActivityFeed events={data.events} />
      </div>
    </div>
  )
}
