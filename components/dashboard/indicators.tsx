import { Badge } from '@/components/ds/badge'
import { cn } from '@/lib/utils'
import {
  CLIENT_STATUS_LABELS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  PRODUCT_STATUS_LABELS,
  type ClientStatus,
  type TaskStatus,
  type TaskPriority,
  type ProductStatus,
} from '@/lib/types'
import { deadlineState, DEADLINE_META } from '@/lib/deadlines'

const CLIENT_STATUS_STYLE: Record<ClientStatus, string> = {
  lead: 'bg-secondary text-secondary-foreground',
  active: 'bg-flow-lime text-flow-green',
  paused: 'bg-warning/15 text-warning',
  churned: 'bg-muted text-muted-foreground',
}

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <Badge className={cn('border-transparent font-medium', CLIENT_STATUS_STYLE[status])}>
      {CLIENT_STATUS_LABELS[status]}
    </Badge>
  )
}

const TASK_STATUS_STYLE: Record<TaskStatus, string> = {
  todo: 'bg-muted text-muted-foreground',
  in_progress: 'bg-secondary text-secondary-foreground',
  blocked: 'bg-destructive/15 text-destructive',
  review: 'bg-warning/15 text-warning',
  done: 'bg-flow-lime text-flow-green',
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge className={cn('border-transparent font-medium', TASK_STATUS_STYLE[status])}>
      {TASK_STATUS_LABELS[status]}
    </Badge>
  )
}

const PRIORITY_STYLE: Record<TaskPriority, string> = {
  low: 'text-muted-foreground',
  medium: 'text-foreground',
  high: 'text-warning',
  urgent: 'text-destructive',
}

export function PriorityLabel({ priority }: { priority: TaskPriority }) {
  return <span className={cn('text-sm font-medium', PRIORITY_STYLE[priority])}>{TASK_PRIORITY_LABELS[priority]}</span>
}

const PRODUCT_STATUS_STYLE: Record<ProductStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  in_progress: 'bg-secondary text-secondary-foreground',
  review: 'bg-warning/15 text-warning',
  live: 'bg-flow-lime text-flow-green',
  rejected: 'bg-destructive/15 text-destructive',
  paused: 'bg-muted text-muted-foreground',
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <Badge className={cn('border-transparent font-medium', PRODUCT_STATUS_STYLE[status])}>
      {PRODUCT_STATUS_LABELS[status]}
    </Badge>
  )
}

export function DeadlineIndicator({
  dueDate,
  status,
}: {
  dueDate: string | null
  status: TaskStatus
}) {
  const state = deadlineState({ due_date: dueDate, status })
  const meta = DEADLINE_META[state]
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn('h-2 w-2 rounded-full', meta.dot)} />
      <span className={cn('text-sm', meta.text)}>
        {dueDate ? new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : meta.label}
      </span>
    </span>
  )
}
