'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { getJobDownloadUrlAction } from '@/lib/db/automation-actions'
import type { AutomationJob } from '@/lib/types'
import { Button } from '@/components/ds/button'
import { Card, CardContent } from '@/components/ds/card'

interface Progress {
  done: number
  failed: number
  total: number
  remaining: number
}

export function JobRunner({ job }: { job: AutomationJob }) {
  const router = useRouter()
  const [progress, setProgress] = useState<Progress>({
    done: job.done_count,
    failed: job.failed_count,
    total: job.total,
    remaining: job.total - job.done_count - job.failed_count,
  })
  const [status, setStatus] = useState(job.status)
  const [running, setRunning] = useState(false)
  const started = useRef(false)

  const run = useCallback(async () => {
    if (started.current) return
    started.current = true
    setRunning(true)
    try {
      // Drive the chunked processor until nothing is left.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const res = await fetch(`/api/automations/${job.id}/process`, { method: 'POST' })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Processing failed')
        const data = (await res.json()) as Progress
        setProgress(data)
        if (data.remaining === 0) break
      }
      setStatus('done')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Processing failed')
    } finally {
      setRunning(false)
      started.current = false
    }
  }, [job.id, router])

  useEffect(() => {
    if (job.status === 'processing' && job.total - job.done_count - job.failed_count > 0) {
      run()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function download() {
    const res = await getJobDownloadUrlAction(job.id)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    window.open(res.url, '_blank')
  }

  const pct = progress.total ? Math.round(((progress.done + progress.failed) / progress.total) * 100) : 0
  const finished = progress.remaining === 0 && progress.total > 0
  const downloadLabel = job.type === 'image' ? 'Download images (.zip)' : 'Download sheet (.xlsx)'

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {running ? (
              <Loader2 className="h-5 w-5 animate-spin text-warning" />
            ) : finished ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              {running ? 'Processing…' : finished ? 'Completed' : 'Paused'}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {progress.done + progress.failed}/{progress.total}
            {progress.failed > 0 && <span className="ml-2 text-destructive">{progress.failed} failed</span>}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-flow-green transition-all" style={{ width: `${pct}%` }} />
        </div>

        <div className="flex gap-2">
          {finished ? (
            <Button onClick={download}>
              <Download className="h-4 w-4" /> {downloadLabel}
            </Button>
          ) : (
            !running && (
              <Button onClick={run} variant="outline">
                Resume processing
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}
