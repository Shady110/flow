'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ds/button'
import { getRequirementDownloadUrlAction } from '@/lib/db/requirement-actions'
import type { RequirementStatus } from '@/lib/types'

const TONE: Record<RequirementStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  submitted: 'bg-amber-100 text-amber-900',
  approved: 'bg-flow-lime/40 text-flow-green',
  rejected: 'bg-destructive/10 text-destructive',
  waived: 'bg-muted text-muted-foreground line-through',
}

export function RequirementStatusBadge({ status, label }: { status: RequirementStatus; label: string }) {
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', TONE[status])}>
      {label}
    </span>
  )
}

/** Opens the stored file through a short-lived signed URL. */
export function ViewFileButton({ requirementId, label }: { requirementId: string; label: string }) {
  const [busy, setBusy] = useState(false)
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        const res = await getRequirementDownloadUrlAction(requirementId)
        setBusy(false)
        if (!res.ok) return void toast.error(res.error)
        // Same tab if the browser blocks the popup (common on iOS after an await).
        if (!window.open(res.url, '_blank', 'noopener')) window.location.href = res.url
      }}
    >
      <ExternalLink className="h-4 w-4" /> {label}
    </Button>
  )
}
