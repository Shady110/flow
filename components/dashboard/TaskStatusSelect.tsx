'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateTaskAction } from '@/lib/db/task-actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ds/select'
import { TASK_STATUS_LABELS } from '@/lib/constants'
import type { TaskStatus } from '@/lib/types'

export function TaskStatusSelect({
  taskId,
  clientId,
  status,
}: {
  taskId: string
  clientId: string
  status: TaskStatus
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function onChange(next: string) {
    startTransition(async () => {
      const res = await updateTaskAction(taskId, { status: next as TaskStatus, client_id: clientId })
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <Select value={status} onValueChange={onChange} disabled={pending}>
      <SelectTrigger className="h-8 w-[140px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            {TASK_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
