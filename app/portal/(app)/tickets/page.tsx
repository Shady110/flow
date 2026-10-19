import Link from 'next/link'
import { format } from 'date-fns'
import { getTranslations } from 'next-intl/server'
import { requireClientContext } from '@/lib/auth/client-session'
import { getPlatforms } from '@/lib/db/flow-queries'
import { getTickets } from '@/lib/db/ticket-queries'
import { NewTicketDialog } from '@/components/tickets/NewTicketDialog'
import { TicketStatusBadge } from '@/components/tickets/TicketBits'

export default async function PortalTicketsPage() {
  const { client } = await requireClientContext()
  const [platforms, tickets, t, tm] = await Promise.all([
    getPlatforms(client.id),
    getTickets({ clientId: client.id }),
    getTranslations('internal.tickets'),
    getTranslations('internal.marketplace'),
  ])
  const live = platforms.filter((p) => p.stage === 'managing')
  const label = new Map(platforms.map((p) => [p.id, tm(p.platform)]))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{t('portalTitle')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('portalIntro')}</p>
        </div>
        <NewTicketDialog
          baseHref="/tickets"
          platforms={live.map((p) => ({ id: p.id, platform: p.platform, label: tm(p.platform) }))}
        />
      </div>

      {tickets.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t('portalEmpty')}
        </p>
      ) : (
        <ul className="space-y-3">
          {tickets.map((tk) => (
            <li key={tk.id}>
              <Link
                href={`/tickets/${tk.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-flow-green"
              >
                <div className="min-w-0">
                  <p className="font-medium">{tk.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {tk.number} · {label.get(tk.platform_id)} · {t(`categories.${tk.category}`)} · {format(new Date(tk.created_at), 'PP')}
                  </p>
                </div>
                <TicketStatusBadge status={tk.status} label={t(`statuses.${tk.status}`)} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
