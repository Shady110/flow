import Link from 'next/link'
import { FileSpreadsheet, ImageIcon, ArrowRight } from 'lucide-react'
import { requirePermission } from '@/lib/auth/session'
import { getJobs } from '@/lib/db/automation-queries'
import { PageHeader } from '@/components/dashboard/PageHeader'
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
  const jobs = await getJobs()

  return (
    <div className="space-y-8">
      <PageHeader title="Automations" description="AI-assisted listing & image production." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link href="/automations/listing/new">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="rounded-xl bg-secondary p-3 text-flow-green">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold">Listing automation</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Turn a raw product sheet into marketplace-ready listings — titles,
                  descriptions, bullets, size & weight.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-flow-green">
                  New listing job <ArrowRight className="h-3.5 w-3.5" />
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
                <h3 className="font-display text-lg font-bold">Image automation</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Turn product photos into clean white-background front, side & back shots
                  for every marketplace.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-flow-green">
                  New image job <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold">Recent jobs</h2>
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No automation jobs yet.</p>
        ) : (
          <Card className="p-0">
            <ul className="divide-y divide-border">
              {jobs.map((j) => (
                <li key={j.id}>
                  <Link
                    href={`/automations/${j.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-muted/50"
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
                          {j.done_count}/{j.total} done · {new Date(j.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={cn('border-transparent font-medium capitalize', STATUS_STYLE[j.status])}>
                      {j.status}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  )
}
