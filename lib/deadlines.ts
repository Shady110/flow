import { differenceInCalendarDays, isValid, parseISO } from 'date-fns'
import type { Task, TaskStatus } from '@/lib/types'

export type DeadlineState = 'none' | 'on_track' | 'due_soon' | 'overdue' | 'done'

/** Days from now until the due date is considered "due soon". */
export const DUE_SOON_THRESHOLD = 3

export function deadlineState(task: Pick<Task, 'due_date' | 'status'>): DeadlineState {
  if (task.status === 'done') return 'done'
  if (!task.due_date) return 'none'
  const due = parseISO(task.due_date)
  if (!isValid(due)) return 'none'
  const days = differenceInCalendarDays(due, new Date())
  if (days < 0) return 'overdue'
  if (days <= DUE_SOON_THRESHOLD) return 'due_soon'
  return 'on_track'
}

export function isActive(status: TaskStatus) {
  return status !== 'done'
}

export const DEADLINE_META: Record<
  DeadlineState,
  { label: string; dot: string; text: string }
> = {
  none: { label: 'No due date', dot: 'bg-muted-foreground/40', text: 'text-muted-foreground' },
  on_track: { label: 'On track', dot: 'bg-success', text: 'text-success' },
  due_soon: { label: 'Due soon', dot: 'bg-warning', text: 'text-warning' },
  overdue: { label: 'Overdue', dot: 'bg-destructive', text: 'text-destructive' },
  done: { label: 'Done', dot: 'bg-flow-green', text: 'text-flow-green' },
}
