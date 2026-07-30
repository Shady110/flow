'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateLeadAction } from '@/lib/db/lead-actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ds/select'
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from '@/lib/constants'
import type { LeadStatus } from '@/lib/types'

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function onChange(next: string) {
    startTransition(async () => {
      const res = await updateLeadAction(leadId, { status: next as LeadStatus })
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      router.refresh()
    })
  }

  return (
    // Stop clicks/keys from bubbling to a clickable parent row (LinkedTableRow).
    <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <Select value={status} onValueChange={onChange} disabled={pending}>
        <SelectTrigger className="h-9 w-[160px] text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LEAD_STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="text-sm">
              {LEAD_STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </span>
  )
}
