import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { requirePermission } from '@/lib/auth/session'
import { getClient, getTeam } from '@/lib/db/queries'
import { getPlatforms } from '@/lib/db/flow-queries'
import { getTicket, getTicketMessages } from '@/lib/db/ticket-queries'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TicketControls } from '@/components/tickets/TicketControls'
import { TicketThread } from '@/components/tickets/TicketThread'
import { TicketStatusBadge } from '@/components/tickets/TicketBits'
import { Card, CardContent } from '@/components/ds/card'

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission('tickets.manage')
  const { id } = await params
  const ticket = await getTicket(id)
  if (!ticket) notFound()

  const [messages, client, platforms, team, t, tm] = await Promise.all([
    getTicketMessages(id),
    getClient(ticket.client_id),
    getPlatforms(ticket.client_id),
    getTeam(),
    getTranslations('internal.tickets'),
    getTranslations('internal.marketplace'),
  ])
  const platform = platforms.find((p) => p.id === ticket.platform_id)
  const names = Object.fromEntries(team.map((m) => [m.id, m.full_name ?? '—']))

  return (
    <div className="space-y-6">
      <Link href="/accounts/tickets" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('backToQueue')}
      </Link>
      <PageHeader
        title={`${ticket.number} · ${ticket.title}`}
        description={`${client?.name ?? '—'}${platform ? ` · ${tm(platform.platform)}` : ''} · ${t(`categories.${ticket.category}`)}${ticket.source === 'offline' ? ` · ${t('offlineTag')}` : ''}`}
        actions={<TicketStatusBadge status={ticket.status} label={t(`statuses.${ticket.status}`)} />}
      />
      <Card>
        <CardContent className="space-y-6 p-5">
          <TicketControls
            ticket={ticket}
            team={team.map((m) => ({ id: m.id, label: m.full_name ?? m.id }))}
          />
          {ticket.body && <p className="whitespace-pre-line rounded-lg bg-muted/40 p-4 text-sm">{ticket.body}</p>}
          <TicketThread
            ticketId={ticket.id}
            messages={messages}
            viewer="staff"
            staffNames={names}
            clientLabel={client?.name ?? t('client')}
            closed={ticket.status === 'closed'}
          />
        </CardContent>
      </Card>
    </div>
  )
}
