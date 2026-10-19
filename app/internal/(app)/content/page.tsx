import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { requirePermission } from '@/lib/auth/session'
import { getClients } from '@/lib/db/queries'
import { getPlatforms } from '@/lib/db/flow-queries'
import { getDeliverableProgress } from '@/lib/db/requirement-queries'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card } from '@/components/ds/card'

export default async function ContentQueuePage() {
  await requirePermission('content.workspace')
  const [clients, platforms, t, tm] = await Promise.all([
    getClients(),
    getPlatforms(),
    getTranslations('internal.content'),
    getTranslations('internal.marketplace'),
  ])
  // RLS already limits Content to accounts at `listing`; the CEO sees all, so filter here too.
  const queue = platforms.filter((p) => p.stage === 'listing')
  const progress = await getDeliverableProgress(queue.map((p) => p.id))
  const client = new Map(clients.map((c) => [c.id, c]))

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />
      {queue.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {queue.map((p) => {
            const pr = progress.get(p.id)
            const ready = !!pr && pr.missing === 0
            return (
              <Link key={p.id} href={`/content/${p.id}`}>
                <Card className="h-full space-y-3 p-5 transition-colors hover:border-flow-green">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-lg font-bold">{client.get(p.client_id)?.name ?? '—'}</p>
                      <p className="text-sm text-muted-foreground">{tm(p.platform)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                  </div>
                  <p className="flex items-center gap-2 text-sm">
                    {ready && <CheckCircle2 className="h-4 w-4 text-flow-green" />}
                    {pr
                      ? t('progress', { done: pr.required - pr.missing, total: pr.required })
                      : t('noDeliverables')}
                  </p>
                  {client.get(p.client_id)?.target_live_date && (
                    <p className="text-xs text-muted-foreground">
                      {t('targetLive', { date: client.get(p.client_id)!.target_live_date! })}
                    </p>
                  )}
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
