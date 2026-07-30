import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { FileSpreadsheet, ImageIcon, ArrowRight } from 'lucide-react'
import { requirePermission } from '@/lib/auth/session'
import { getJobs } from '@/lib/db/automation-queries'
import { deleteJobAction } from '@/lib/db/automation-actions'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ConfirmDelete } from '@/components/dashboard/ConfirmDelete'
import { Card, CardContent } from '@/components/ds/card'
import { Badge } from '@/components/ds/badge'
import { cn } from '@/lib/utils'
import type { JobStatus } from '@/lib/types'

const STATUS_STYLE: Record<JobStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  processing: 'bg-warning/15 text-warning',
  done: 'bg-flow-lime text-flow-green',
  failed: 'bg-destructive/15 text-destructive',
}

export default async function AutomationsPage() {
  await requirePermission('automation.run')
  const [jobs, t, tj] = await Promise.all([
    getJobs(),
    getTranslations('internal.automations'),
    getTranslations('internal.jobStatus'),
  ])

  return (
    <div className="space-y-8">
      <PageHeader title={t('title')} description={t('description')} />

      <p className="rounded-lg bg-muted px-4 py-2.5 text-xs text-muted-foreground">
        {t('notice')}
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link href="/automations/listing/new">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="rounded-xl bg-secondary p-3 text-flow-green">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold">{t('listingTitle')}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('listingDesc')}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-flow-green">
                  {t('newListing')} <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/automations/image/new">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="rounded-xl bg-secondary p-3 text-flow-green">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold">{t('imageTitle')}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('imageDesc')}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-flow-green">
                  {t('newImage')} <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold">{t('recentJobs')}</h2>
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noJobs')}</p>
        ) : (
          <Card className="p-0">
            <ul className="divide-y divide-border">
              {jobs.map((j) => (
                <li key={j.id} className="flex items-center gap-2 pe-4 transition-colors hover:bg-muted/50">
                  <Link
                    href={`/automations/${j.id}`}
                    className="flex flex-1 items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      {j.type === 'listing' ? (
                        <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {j.type} {j.marketplace ? `· ${j.marketplace}` : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('doneCount', { done: j.done_count, total: j.total })} · {new Date(j.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={cn('border-transparent font-medium', STATUS_STYLE[j.status])}>
                      {tj(j.status)}
                    </Badge>
                  </Link>
                  <ConfirmDelete
                    action={deleteJobAction}
                    args={[j.id]}
                    title="Delete this job?"
                    description="The job and its items are removed. Generated files stay in storage."
                    successMessage="Job deleted"
                    compact
                  />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  )
}
