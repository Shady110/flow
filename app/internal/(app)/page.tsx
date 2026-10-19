import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { FileSignature, Users, Briefcase, LifeBuoy } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/session'
import { getCeoOverview } from '@/lib/db/overview-queries'
import { homePathFor } from '@/lib/home'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { Button } from '@/components/ds/button'
import { PipelineStrip } from '@/components/overview/PipelineStrip'
import { AttentionFeed } from '@/components/overview/AttentionFeed'
import { MoneyPanel } from '@/components/overview/MoneyPanel'
import { WorkloadPanel } from '@/components/overview/WorkloadPanel'
import { ActivityFeed } from '@/components/overview/ActivityFeed'

export default async function OverviewPage() {
  // The company overview is the CEO's; everyone else lands on their own section.
  const viewer = await getCurrentUser()
  if (viewer && !viewer.permissions.has('ops.overview')) {
    const home = homePathFor(viewer.permissions)
    if (home !== '/') redirect(home)
  }

  const [data, t, locale] = await Promise.all([getCeoOverview(), getTranslations('internal.overview'), getLocale()])
  const { kpis } = data
  const first = (viewer?.full_name ?? '').trim().split(/\s+/)[0]
  const today = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
  const canSeeMoney = !!viewer?.permissions.has('finance.view')

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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          variant="hero"
          icon={Users}
          label={t('kpiActive')}
          value={kpis.activeClients}
          chip={kpis.newClientsThisMonth ? { text: t('kpiNewMonth', { count: kpis.newClientsThisMonth }), tone: 'good' } : undefined}
          href="/clients"
        />
        <StatCard
          label={t('kpiCap')}
          value={`${kpis.cap.won} / ${kpis.cap.cap}`}
          chip={{ text: kpis.cap.won >= kpis.cap.cap ? t('kpiCapFull') : t('kpiCapLeft', { count: kpis.cap.cap - kpis.cap.won }), tone: kpis.cap.won >= kpis.cap.cap ? 'warn' : 'neutral' }}
          href="/leads"
        />
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
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <PipelineStrip counts={data.pipeline} />
          {canSeeMoney && <MoneyPanel finance={data.finance} budget={data.budget} />}
        </div>
        <div className="xl:col-span-4">
          <AttentionFeed items={data.attention} clientNames={data.clientNames} />
        </div>
        <div className="xl:col-span-6">
          <WorkloadPanel rows={data.workload} />
        </div>
        <div className="xl:col-span-6">
          <ActivityFeed events={data.events} />
        </div>
      </div>
    </div>
  )
}
