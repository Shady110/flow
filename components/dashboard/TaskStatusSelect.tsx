'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { updateTaskAction } from '@/lib/db/task-actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ds/select'
import type { TaskStatus } from '@/lib/types'

const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'review', 'done']

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
  const t = useTranslations('internal.status')
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
        {TASK_STATUSES.map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            {t(s)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
