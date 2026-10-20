import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { FileSignature, Users, Briefcase, LifeBuoy } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/session'
import { getCeoOverview } from '@/lib/db/overview-queries'
import { getDepartments } from '@/lib/db/queries'
import { homePathFor } from '@/lib/home'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { Button } from '@/components/ds/button'
import { PipelineStrip } from '@/components/overview/PipelineStrip'
import { AttentionFeed } from '@/components/overview/AttentionFeed'
import { MoneyPanel } from '@/components/overview/MoneyPanel'
import { WorkloadPanel } from '@/components/overview/WorkloadPanel'
import { ActivityFeed } from '@/components/overview/ActivityFeed'
import { CapRingTile } from '@/components/overview/CapRingTile'
import { Skeleton } from '@/components/ds/skeleton'
import type { CurrentUser } from '@/lib/types'

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ start?: string }> }) {
  // The company overview is for whoever holds it; everyone else lands on their department's workspace.
  // Right after signing in (?start=1) everyone starts in their own department workspace.
  const [viewer, { start }] = await Promise.all([getCurrentUser(), searchParams])
  if (viewer && (!viewer.permissions.has('ops.overview') || start === '1')) {
    const departments = await getDepartments()
    const dept = departments.find((d) => d.key === viewer.department_key)
    const home = homePathFor(viewer.permissions, dept?.home_path)
    if (home !== '/') redirect(home)
  }

  const [t, locale] = await Promise.all([getTranslations('internal.overview'), getLocale()])
  const first = (viewer?.full_name ?? '').trim().split(/\s+/)[0]
  const today = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

  return (
    <div className="space-y-6">
      <PageHeader
        title={first ? t('greeting', { name: first }) : t('title')}
        description={`${today} · ${t('description')}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/contracts/new"><FileSignature className="h-4 w-4" /> {t('newContract')}</Link>
            </Button>
            <Button asChild>
              <Link href="/pipeline">{t('openPipeline')}</Link>
            </Button>
          </>
        }
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
  const [data, t] = await Promise.all([getCeoOverview(), getTranslations('internal.overview')])
  const { kpis } = data
  const canSeeMoney = !!viewer?.permissions.has('finance.view')
  const capFull = kpis.cap.won >= kpis.cap.cap

  // A bento: wide hero + ring up top, the pipeline across, then money / attention, then people / activity.
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <div className="col-span-2">
        <StatCard
          variant="hero"
          icon={Users}
          label={t('kpiActive')}
          value={kpis.activeClients}
          chip={kpis.newClientsThisMonth ? { text: t('kpiNewMonth', { count: kpis.newClientsThisMonth }), tone: 'good' } : undefined}
          href="/clients"
        />
      </div>
      <Link href="/leads" className="col-span-2 block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:col-span-1">
        <CapRingTile
          label={t('kpiCap')}
          won={kpis.cap.won}
          cap={kpis.cap.cap}
          full={capFull}
          note={capFull ? t('kpiCapFull') : t('kpiCapLeft', { count: kpis.cap.cap - kpis.cap.won })}
        />
      </Link>
      <StatCard
        icon={Briefcase}
        label={t('kpiLive')}
        value={kpis.accountsLive}
        chip={kpis.accountsAtRisk ? { text: t('kpiAtRisk', { count: kpis.accountsAtRisk }), tone: 'bad' } : { text: t('kpiHealthy'), tone: 'good' }}
        href="/accounts"
      />
      <StatCard
        icon={LifeBuoy}
        label={t('kpiTickets')}
        value={kpis.openTickets}
        tone={kpis.urgentTickets ? 'danger' : 'default'}
        chip={kpis.urgentTickets ? { text: t('kpiUrgent', { count: kpis.urgentTickets }), tone: 'bad' } : undefined}
        href="/accounts/tickets"
      />
      <div className="col-span-2 xl:col-span-3">
        <PipelineStrip counts={data.pipeline} />
      </div>
      {canSeeMoney && (
        <div className="col-span-2">
          <MoneyPanel finance={data.finance} budget={data.budget} />
        </div>
      )}
      <div className={canSeeMoney ? 'col-span-2' : 'col-span-2 xl:col-span-4'}>
        <AttentionFeed items={data.attention} clientNames={data.clientNames} />
      </div>
      <div className="col-span-2">
        <WorkloadPanel rows={data.workload} teamHref={viewer?.permissions.has('team.view') ? '/team' : undefined} />
      </div>
      <div className="col-span-2">
        <ActivityFeed events={data.events} />
      </div>
    </div>
  )
}
