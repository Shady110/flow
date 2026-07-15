'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ds/badge'
import { cn } from '@/lib/utils'
import type { ClientStatus, TaskStatus, TaskPriority, ProductStatus, InvoiceStatus } from '@/lib/types'
import { deadlineState } from '@/lib/deadlines'

const CLIENT_STATUS_STYLE: Record<ClientStatus, string> = {
  lead: 'bg-secondary text-secondary-foreground',
  active: 'bg-flow-lime text-flow-green',
  paused: 'bg-warning/15 text-warning',
  churned: 'bg-muted text-muted-foreground',
}

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  const t = useTranslations('internal.clientStatus')
  return (
    <Badge className={cn('border-transparent font-medium', CLIENT_STATUS_STYLE[status])}>
      {t(status)}
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
  const t = useTranslations('internal.status')
  return (
    <Badge className={cn('border-transparent font-medium', TASK_STATUS_STYLE[status])}>
      {t(status)}
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
  const t = useTranslations('internal.priority')
  return <span className={cn('text-sm font-medium', PRIORITY_STYLE[priority])}>{t(priority)}</span>
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
  const t = useTranslations('internal.productStatus')
  return (
    <Badge className={cn('border-transparent font-medium', PRODUCT_STATUS_STYLE[status])}>
      {t(status)}
    </Badge>
  )
}

const INVOICE_STATUS_STYLE: Record<InvoiceStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-warning/15 text-warning',
  paid: 'bg-flow-lime text-flow-green',
  void: 'bg-destructive/15 text-destructive',
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const t = useTranslations('internal.invoiceStatus')
  return (
    <Badge className={cn('border-transparent font-medium', INVOICE_STATUS_STYLE[status])}>
      {t(status)}
    </Badge>
  )
}

const DEADLINE_DOT: Record<string, string> = {
  overdue: 'bg-destructive',
  due_soon: 'bg-warning',
  on_track: 'bg-success',
  done: 'bg-flow-lime',
  none: 'bg-muted-foreground',
}
const DEADLINE_TEXT: Record<string, string> = {
  overdue: 'text-destructive',
  due_soon: 'text-warning',
  on_track: 'text-foreground',
  done: 'text-flow-green',
  none: 'text-muted-foreground',
}

export function DeadlineIndicator({
  dueDate,
  status,
}: {
  dueDate: string | null
  status: TaskStatus
}) {
  const t = useTranslations('internal.deadline')
  const state = deadlineState({ due_date: dueDate, status })
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn('h-2 w-2 rounded-full', DEADLINE_DOT[state] ?? 'bg-muted-foreground')} />
      <span className={cn('text-sm', DEADLINE_TEXT[state] ?? 'text-muted-foreground')}>
        {dueDate ? new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : t(state)}
      </span>
    </span>
  )
}
