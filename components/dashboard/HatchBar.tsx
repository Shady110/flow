import { cn } from '@/lib/utils'

/**
 * Progress pill: solid = done, hatched track = still to go. Pass `tone="warn"`
 * for something stuck and `tone="lime"` on dark panels.
 */
export function HatchBar({
  value,
  max,
  tone = 'green',
  className,
}: {
  value: number
  max: number
  tone?: 'green' | 'lime' | 'warn' | 'danger'
  className?: string
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  const fill = { green: 'bg-flow-green', lime: 'bg-flow-lime', warn: 'bg-warning', danger: 'bg-destructive' }[tone]
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
      className={cn('hatch h-2.5 overflow-hidden rounded-full bg-muted', className)}
    >
      <div className={cn('h-full rounded-full', fill)} style={{ width: `${pct}%` }} />
    </div>
  )
}
