import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { requirePermission } from '@/lib/auth/session'
import { getJob, getJobItems, getJobCosts } from '@/lib/db/automation-queries'
import { formatCost } from '@/lib/money'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { JobRunner } from '@/components/automation/JobRunner'
import { Card } from '@/components/ds/card'
import { Badge } from '@/components/ds/badge'
import { cn } from '@/lib/utils'
import type { ItemStatus } from '@/lib/types'

const ITEM_STATUS_STYLE: Record<ItemStatus, string> = {
  queued: 'bg-muted text-muted-foreground',
  processing: 'bg-warning/15 text-warning',
  done: 'bg-flow-lime text-flow-green',
  failed: 'bg-destructive/15 text-destructive',
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  await requirePermission('automation.run')
  const { jobId } = await params
  const job = await getJob(jobId)
  if (!job) notFound()
  const [items, costs, t] = await Promise.all([
    getJobItems(jobId),
    getJobCosts(),
    getTranslations('internal.automations'),
  ])
  const cost = costs.get(jobId)

  const clean = (job.params as { mode?: string }).mode === 'clean'

  const itemLabel = (input: Record<string, unknown>, position: number) => {
    if (job.type === 'image') {
      return String(input.sku ?? `${clean ? 'Image' : 'Product'} ${position + 1}`)
    }
    const canonical = (input.canonical ?? {}) as Record<string, string>
    return canonical.sku || canonical.name || `Row ${position + 1}`
  }

  const description =
    job.type === 'listing'
      ? `${job.marketplace ?? ''} · ${job.total} products`
      : clean
        ? `${job.total} images · white background`
        : `${job.total} products · front / side / back`

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/automations"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to automations
      </Link>
      <PageHeader
        title={job.type === 'listing' ? 'Listing job' : clean ? 'Image clean-up job' : 'Image job'}
        description={description}
      />
      <JobRunner job={job} />

      {cost && (
        <Card className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4">
          <span className="text-sm text-muted-foreground">
            {t('costJob')} · {t('costCalls', { calls: cost.calls, images: cost.images })}
          </span>
          <span className="text-sm font-medium">
            {formatCost(cost.usd)}
            <span className="ms-2 text-muted-foreground">{formatCost(cost.egp, 'EGP')}</span>
          </span>
        </Card>
      )}

      <Card className="p-0">
        <ul className="divide-y divide-border">
          {items.map((it) => (
            <li key={it.id} className="flex items-start justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{itemLabel(it.input, it.position)}</p>
                {it.status === 'failed' && it.error && (
                  <p className="mt-0.5 text-xs text-destructive">{it.error}</p>
                )}
              </div>
              <Badge className={cn('border-transparent font-medium capitalize', ITEM_STATUS_STYLE[it.status])}>
                {it.status}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
