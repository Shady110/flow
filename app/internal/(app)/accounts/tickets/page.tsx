import Link from 'next/link'
import { format } from 'date-fns'
import { getTranslations } from 'next-intl/server'
import { requirePermission } from '@/lib/auth/session'
import { getClients, getTeam } from '@/lib/db/queries'
import { getPlatforms } from '@/lib/db/flow-queries'
import { getTickets } from '@/lib/db/ticket-queries'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { NewTicketDialog } from '@/components/tickets/NewTicketDialog'
import { PriorityDot, TicketStatusBadge } from '@/components/tickets/TicketBits'
import { LinkedTableRow } from '@/components/dashboard/LinkedTableRow'
import { Button } from '@/components/ds/button'
import { Card } from '@/components/ds/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ds/table'
import { cn } from '@/lib/utils'

const VIEWS = ['active', 'resolved', 'all'] as const

export default async function TicketQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; mine?: string }>
}) {
  const user = await requirePermission('tickets.manage')
  const sp = await searchParams
  const view = (VIEWS as readonly string[]).includes(sp.view ?? '') ? (sp.view as (typeof VIEWS)[number]) : 'active'
  const mine = sp.mine === '1'

  const [tickets, clients, platforms, team, t, tm] = await Promise.all([
    getTickets({ status: view === 'active' ? 'active' : undefined, assigneeId: mine ? user.id : undefined }),
    getClients(),
    getPlatforms(),
    getTeam(),
    getTranslations('internal.tickets'),
    getTranslations('internal.marketplace'),
  ])
  const shown = view === 'resolved' ? tickets.filter((x) => x.status === 'resolved' || x.status === 'closed') : tickets
  const clientName = new Map(clients.map((c) => [c.id, c.name]))
  const platformOf = new Map(platforms.map((p) => [p.id, p]))
  const person = new Map(team.map((m) => [m.id, m.full_name ?? '—']))

  const options = platforms
    .filter((p) => p.stage === 'managing' || p.stage === 'pushing')
    .map((p) => ({ id: p.id, platform: p.platform, label: `${clientName.get(p.client_id) ?? '—'} · ${tm(p.platform)}` }))

  const tab = (v: string, label: string) => (
    <Link
      href={`/accounts/tickets?view=${v}${mine ? '&mine=1' : ''}`}
      className={cn('rounded-full px-3 py-1 text-sm', view === v ? 'bg-flow-green text-white' : 'bg-muted text-muted-foreground hover:text-foreground')}
    >
      {label}
    </Link>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('queueTitle')}
        description={t('queueDescription')}
        actions={<NewTicketDialog staff baseHref="/accounts/tickets" platforms={options} />}
      />
      <div className="flex flex-wrap items-center gap-2">
        {tab('active', t('viewActive'))}
        {tab('resolved', t('viewResolved'))}
        {tab('all', t('viewAll'))}
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/accounts/tickets?view=${view}${mine ? '' : '&mine=1'}`}>
            {mine ? t('showEveryone') : t('onlyMine')}
          </Link>
        </Button>
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('queueEmpty')}</p>
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('ticket')}</TableHead>
                <TableHead>{t('account')}</TableHead>
                <TableHead>{t('category')}</TableHead>
                <TableHead>{t('assignee')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('updated')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((tk) => {
                const p = platformOf.get(tk.platform_id)
                return (
                  <LinkedTableRow key={tk.id} href={`/accounts/tickets/${tk.id}`}>
                    <TableCell>
                      <span className="font-medium">{tk.number}</span>
                      <span className="block text-sm">{tk.title}</span>
                      <PriorityDot priority={tk.priority} label={t(`priorities.${tk.priority}`)} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {clientName.get(tk.client_id) ?? '—'}{p ? ` · ${tm(p.platform)}` : ''}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{t(`categories.${tk.category}`)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {tk.assignee_id ? (person.get(tk.assignee_id) ?? '—') : '—'}
                    </TableCell>
                    <TableCell><TicketStatusBadge status={tk.status} label={t(`statuses.${tk.status}`)} /></TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(tk.updated_at), 'PP')}</TableCell>
                  </LinkedTableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
