import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { requireClientContext } from '@/lib/auth/client-session'
import { getPlatforms } from '@/lib/db/flow-queries'
import { getTicket, getTicketMessages } from '@/lib/db/ticket-queries'
import { TicketThread } from '@/components/tickets/TicketThread'
import { TicketStatusBadge } from '@/components/tickets/TicketBits'

export default async function PortalTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { client } = await requireClientContext()
  const { id } = await params
  const ticket = await getTicket(id)
  if (!ticket || ticket.client_id !== client.id) notFound()

  const [messages, platforms, t, tm] = await Promise.all([
    getTicketMessages(id),
    getPlatforms(client.id),
    getTranslations('internal.tickets'),
    getTranslations('internal.marketplace'),
  ])
  const platform = platforms.find((p) => p.id === ticket.platform_id)

  return (
    <div className="space-y-6">
      <Link href="/tickets" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('portalBack')}
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{ticket.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ticket.number} · {platform ? tm(platform.platform) : ''} · {t(`categories.${ticket.category}`)}
          </p>
        </div>
        <TicketStatusBadge status={ticket.status} label={t(`statuses.${ticket.status}`)} />
      </div>
      {ticket.body && <p className="whitespace-pre-line rounded-xl bg-muted/40 p-4 text-sm">{ticket.body}</p>}
      <TicketThread
        ticketId={ticket.id}
        messages={messages}
        viewer="client"
        staffNames={{}}
        clientLabel={client.name}
        closed={ticket.status === 'closed'}
      />
    </div>
  )
}
