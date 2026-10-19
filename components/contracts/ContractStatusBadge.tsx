import { cn } from '@/lib/utils'
import type { ContractStatus } from '@/lib/types'

const TONE: Record<ContractStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-amber-100 text-amber-900',
  accepted: 'bg-flow-lime/40 text-flow-green',
  void: 'bg-muted text-muted-foreground line-through',
}

export function ContractStatusBadge({ status, label }: { status: ContractStatus; label: string }) {
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', TONE[status])}>
      {label}
    </span>
  )
}
