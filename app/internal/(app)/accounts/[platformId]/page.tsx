import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { requirePermission } from '@/lib/auth/session'
import { getClient } from '@/lib/db/queries'
import { getPlatforms } from '@/lib/db/flow-queries'
import { getTickets } from '@/lib/db/ticket-queries'
import { PLATFORM_STAGES } from '@/lib/constants'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { AccountStatusCard } from '@/components/tickets/AccountStatusCard'
import { NewTicketDialog } from '@/components/tickets/NewTicketDialog'
import { TicketStatusBadge } from '@/components/tickets/TicketBits'
import { Button } from '@/components/ds/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'

export default async function AccountPage({ params }: { params: Promise<{ platformId: string }> }) {
  const user = await requirePermission('accounts.workspace')
  const { platformId } = await params
  const platform = (await getPlatforms()).find((p) => p.id === platformId)
  if (!platform || (platform.stage !== 'pushing' && platform.stage !== 'managing')) notFound()

  const [client, tickets, t, tm, tt] = await Promise.all([
    getClient(platform.client_id),
    getTickets({ platformId }),
    getTranslations('internal.accounts'),
    getTranslations('internal.marketplace'),
    getTranslations('internal.tickets'),
  ])
  if (!client) notFound()

  const at = PLATFORM_STAGES.indexOf(platform.stage)
  const next = platform.stage === 'pushing'
    ? (platform.stages.find((s) => PLATFORM_STAGES.indexOf(s) > at) ?? null)
    : null
  const canTicket = user.permissions.has('tickets.manage')

  return (
    <div className="space-y-6">
      <Link href="/accounts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('back')}
      </Link>
      <PageHeader
        title={`${client.name} · ${tm(platform.platform)}`}
        description={platform.stage === 'pushing' ? t('stagePushing') : t('stageManaging')}
        actions={
          <>
            <Button variant="outline" asChild><Link href={`/clients/${client.id}`}>{t('client')}</Link></Button>
            {canTicket && (
              <NewTicketDialog
                staff
                baseHref="/accounts/tickets"
                platforms={[{ id: platform.id, platform: platform.platform, label: tm(platform.platform) }]}
              />
            )}
          </>
        }
      />

      <AccountStatusCard platform={platform} nextStage={next} />

      <Card>
        <CardHeader><CardTitle className="text-base">{t('ticketsTitle')}</CardTitle></CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('noTickets')}</p>
          ) : (
            <ul className="divide-y divide-border">
              {tickets.map((tk) => (
                <li key={tk.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <Link href={`/accounts/tickets/${tk.id}`} className="font-medium hover:underline">
                      {tk.number} · {tk.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {tt(`categories.${tk.category}`)} · {format(new Date(tk.created_at), 'PP')}
                    </p>
                  </div>
                  <TicketStatusBadge status={tk.status} label={tt(`statuses.${tk.status}`)} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
