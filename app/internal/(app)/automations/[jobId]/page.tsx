import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { requirePermission } from '@/lib/auth/session'
import { getJob } from '@/lib/db/automation-queries'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { JobRunner } from '@/components/automation/JobRunner'

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  await requirePermission('automation.run')
  const { jobId } = await params
  const job = await getJob(jobId)
  if (!job) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/automations"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to automations
      </Link>
      <PageHeader
        title={job.type === 'image' ? 'Image job' : 'Listing job'}
        description={
          job.type === 'listing'
            ? `${job.marketplace ?? ''} · ${job.total} products`
            : `${job.total} products · front / side / back`
        }
      />
      <JobRunner job={job} />
    </div>
  )
}
