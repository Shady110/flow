import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { ArrowLeft } from 'lucide-react'
import { requireClientContext } from '@/lib/auth/client-session'
import { getPlatforms } from '@/lib/db/flow-queries'
import { getTicket, getTicketMessages } from '@/lib/db/ticket-queries'
import { formatDate } from '@/lib/format'
import { TicketThread } from '@/components/tickets/TicketThread'
import { cn } from '@/lib/utils'

export default async function PortalTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { client } = await requireClientContext()
  const { id } = await params
  const ticket = await getTicket(id)
  if (!ticket || ticket.client_id !== client.id) notFound()

  const [messages, platforms, t, tm, locale] = await Promise.all([
    getTicketMessages(id),
    getPlatforms(client.id),
    getTranslations('portal.requests'),
    getTranslations('internal.marketplace'),
    getLocale(),
  ])
  const platform = platforms.find((p) => p.id === ticket.platform_id)
  const waiting = ticket.status === 'waiting_client'

  return (
    <div className="space-y-6">
      <Link href="/tickets" className="inline-flex min-h-11 items-center gap-2 text-base font-medium text-[var(--brand-ink)]">
        <ArrowLeft className="h-5 w-5 rtl:rotate-180" /> {t('back')}
      </Link>
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{ticket.title}</h1>
        <p className="mt-1 text-base text-muted-foreground">
          {platform ? `${tm(platform.platform)} · ` : ''}{formatDate(ticket.created_at, locale)}
        </p>
        <p className={cn('mt-3 inline-block rounded-full px-4 py-1.5 text-base font-semibold', waiting ? 'bg-amber-100 text-amber-900' : 'bg-muted')}>
          {t(`status.${ticket.status}`)}
        </p>
      </div>
      {waiting && <p className="rounded-2xl bg-amber-50 p-4 text-base text-amber-900">{t('waitingHelp')}</p>}
      {ticket.body && (
        <div className="rounded-3xl bg-muted/50 p-4">
          <p className="mb-1 text-sm font-medium text-muted-foreground">{t('yourRequest')}</p>
          <p className="whitespace-pre-line text-base leading-relaxed">{ticket.body}</p>
        </div>
      )}
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
