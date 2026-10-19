import { cn } from '@/lib/utils'
import type { AccountStatus, TicketPriority, TicketStatus } from '@/lib/types'

const STATUS_TONE: Record<TicketStatus, string> = {
  open: 'bg-amber-100 text-amber-900',
  in_progress: 'bg-sky-100 text-sky-900',
  waiting_client: 'bg-muted text-muted-foreground',
  resolved: 'bg-flow-lime/40 text-flow-green',
  closed: 'bg-muted text-muted-foreground line-through',
}
const ACCOUNT_TONE: Record<AccountStatus, string> = {
  not_created: 'bg-muted text-muted-foreground',
  active: 'bg-flow-lime/40 text-flow-green',
  at_risk: 'bg-amber-100 text-amber-900',
  suspended: 'bg-destructive/10 text-destructive',
  deactivated: 'bg-muted text-muted-foreground line-through',
}

const pill = 'inline-flex rounded-full px-2 py-0.5 text-xs font-medium'

export function TicketStatusBadge({ status, label }: { status: TicketStatus; label: string }) {
  return <span className={cn(pill, STATUS_TONE[status])}>{label}</span>
}

export function AccountStatusBadge({ status, label }: { status: AccountStatus; label: string }) {
  return <span className={cn(pill, ACCOUNT_TONE[status])}>{label}</span>
}

export function PriorityDot({ priority, label }: { priority: TicketPriority; label: string }) {
  return (
    <span
      className={cn(
        'text-xs',
        priority === 'urgent' && 'font-semibold text-destructive',
        priority === 'high' && 'font-medium text-amber-700',
        (priority === 'low' || priority === 'normal') && 'text-muted-foreground',
      )}
    >
      {label}
    </span>
  )
}
