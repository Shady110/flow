import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { ChevronRight, Lock, LifeBuoy } from 'lucide-react'
import { formatDate } from '@/lib/format'
import type { Ticket, TicketStatus } from '@/lib/types'
import { NewRequestSheet, type RequestPlatform } from '@/components/portal/NewRequestSheet'
import { Button } from '@/components/ds/button'
import { cn } from '@/lib/utils'

const CHIP: Record<TicketStatus, string> = {
  open: 'bg-muted text-foreground',
  in_progress: 'bg-sky-100 text-sky-900',
  waiting_client: 'bg-amber-100 text-amber-900',
  resolved: 'bg-flow-lime/60 text-flow-green',
  closed: 'bg-muted text-muted-foreground',
}

/** The client's Requests screen. Locked with a kind explanation until an account is live. */
export async function RequestsView({
  tickets,
  platforms,
  newRequestPlatforms,
  live,
}: {
  tickets: Ticket[]
  /** Every account, to label tickets. */
  platforms: RequestPlatform[]
  /** Only live accounts can receive a new request. */
  newRequestPlatforms: RequestPlatform[]
  live: boolean
}) {
  const [t, locale] = await Promise.all([getTranslations('portal.requests'), getLocale()])
  const where = new Map(platforms.map((p) => [p.id, p.label]))

  const needsReply = tickets.filter((x) => x.status === 'waiting_client')
  const active = tickets.filter((x) => x.status === 'open' || x.status === 'in_progress')
  const finished = tickets.filter((x) => x.status === 'resolved' || x.status === 'closed')

  const card = (x: Ticket) => (
    <li key={x.id}>
      <Link
        href={`/tickets/${x.id}`}
        className={cn(
          'flex min-h-20 items-center gap-3 rounded-3xl border bg-card p-4 shadow-[var(--shadow-xs)] transition-shadow hover:shadow-[var(--shadow-md)] sm:p-5',
          x.status === 'waiting_client' ? 'border-amber-300' : 'border-border/60',
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold leading-snug">{x.title}</span>
          {x.body && <span className="mt-0.5 line-clamp-1 block text-base text-muted-foreground">{x.body}</span>}
          <span className="mt-1 block text-sm text-muted-foreground">
            {where.get(x.platform_id) ?? ''} · {formatDate(x.created_at, locale)}
          </span>
        </span>
        <span className={cn('shrink-0 rounded-full px-3 py-1 text-sm font-semibold', CHIP[x.status])}>{t(`status.${x.status}`)}</span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
      </Link>
    </li>
  )

  const group = (title: string, items: Ticket[]) =>
    items.length > 0 && (
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
        <ul className="space-y-3">{items.map(card)}</ul>
      </section>
    )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-base text-muted-foreground">{t('intro')}</p>
      </div>

      {!live ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Lock className="h-7 w-7" />
          </span>
          <div>
            <p className="font-display text-xl font-bold">{t('lockedTitle')}</p>
            <p className="mt-1 text-base text-muted-foreground">{t('lockedHelp')}</p>
          </div>
          <Button asChild size="lg" variant="outline" className="h-12"><Link href="/chat">{t('lockedCta')}</Link></Button>
        </div>
      ) : (
        <>
          <NewRequestSheet platforms={newRequestPlatforms} />
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <LifeBuoy className="h-10 w-10 text-muted-foreground" />
              <p className="text-base text-muted-foreground">{t('empty')}</p>
            </div>
          ) : (
            <>
              {group(t('groupReply'), needsReply)}
              {group(t('groupActive'), active)}
              {group(t('groupDone'), finished)}
            </>
          )}
        </>
      )}
    </div>
  )
}
