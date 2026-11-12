import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/** A row of steps: done ones ticked, the current one filled, the rest muted. */
export function Stepper({ steps, current }: { steps: { id: string; label: string }[]; current: string }) {
  const at = steps.findIndex((s) => s.id === current)
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-1">
          <span
            className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
              i < at && 'bg-flow-lime/40 text-flow-green',
              i === at && 'bg-flow-green text-white',
              i > at && 'bg-muted text-muted-foreground',
            )}
          >
            {i < at && <Check className="h-3 w-3" />}
            {s.label}
          </span>
          {i < steps.length - 1 && <span className="h-px w-3 bg-border" />}
        </li>
      ))}
    </ol>
  )
}
