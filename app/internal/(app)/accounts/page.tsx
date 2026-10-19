import Link from 'next/link'
import { format } from 'date-fns'
import { getTranslations } from 'next-intl/server'
import { requirePermission } from '@/lib/auth/session'
import { getClients, getTeam } from '@/lib/db/queries'
import { getPlatforms } from '@/lib/db/flow-queries'
import { getTickets } from '@/lib/db/ticket-queries'
import { Briefcase, ShieldAlert, LifeBuoy } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { AccountStatusBadge } from '@/components/tickets/TicketBits'
import { Button } from '@/components/ds/button'
import { Card } from '@/components/ds/card'

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ mine?: string }>
}) {
  const user = await requirePermission('accounts.workspace')
  const { mine } = await searchParams
  const [clients, platforms, team, tickets, t, tm] = await Promise.all([
    getClients(),
    getPlatforms(),
    getTeam(),
    getTickets({ status: 'active' }),
    getTranslations('internal.accounts'),
    getTranslations('internal.marketplace'),
  ])
  const client = new Map(clients.map((c) => [c.id, c]))
  const manager = new Map(team.map((m) => [m.id, m.full_name ?? '—']))
  const openByPlatform = new Map<string, number>()
  for (const tk of tickets) openByPlatform.set(tk.platform_id, (openByPlatform.get(tk.platform_id) ?? 0) + 1)

  // Content-stage accounts are not "accounts" yet. Managers see only their own via RLS;
  // the CEO and view_all can narrow to theirs.
  const accounts = platforms
    .filter((p) => p.stage === 'pushing' || p.stage === 'managing')
    .filter((p) => mine !== '1' || p.account_manager_id === user.id)
  const live = accounts.filter((p) => p.stage === 'managing').length
  const atRisk = accounts.filter((p) => p.account_status === 'at_risk' || p.account_status === 'suspended').length
  const openTotal = accounts.reduce((n, p) => n + (openByPlatform.get(p.id) ?? 0), 0)
  const canSeeAll = user.permissions.has('accounts.view_all') || user.permissions.has('clients.view')

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <>
            {canSeeAll && (
              <Button variant="outline" asChild>
                <Link href={mine === '1' ? '/accounts' : '/accounts?mine=1'}>
                  {mine === '1' ? t('showAll') : t('showMine')}
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild><Link href="/accounts/tickets">{t('tickets')}</Link></Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard variant="hero" className="col-span-2 sm:col-span-1" icon={Briefcase} label={t('kpiLive')} value={live} />
        <StatCard icon={ShieldAlert} label={t('kpiAtRisk')} value={atRisk} tone={atRisk ? 'danger' : 'default'} />
        <StatCard icon={LifeBuoy} label={t('kpiTickets')} value={openTotal} tone={openTotal ? 'warning' : 'default'} href="/accounts/tickets" />
      </div>

      {accounts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((p) => {
            const open = openByPlatform.get(p.id) ?? 0
            return (
              <Link key={p.id} href={`/accounts/${p.id}`}>
                <Card className="h-full space-y-3 p-5 transition-colors hover:border-flow-green">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-lg font-bold">{client.get(p.client_id)?.name ?? '—'}</p>
                      <p className="text-sm text-muted-foreground">
                        {tm(p.platform)}{p.store_name ? ` · ${p.store_name}` : ''}
                      </p>
                    </div>
                    <AccountStatusBadge status={p.account_status} label={t(`status.${p.account_status}`)} />
                  </div>
                  <p className="text-sm">
                    {p.stage === 'pushing' ? t('stagePushing') : t('stageManaging')}
                    {' · '}
                    <span className={open ? 'font-medium text-amber-700' : 'text-muted-foreground'}>
                      {t('openTickets', { count: open })}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('manager')}: {p.account_manager_id ? manager.get(p.account_manager_id) ?? '—' : t('unassigned')}
                    {p.checked_at ? ` · ${t('checked', { date: format(new Date(p.checked_at), 'PP') })}` : ''}
                  </p>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
