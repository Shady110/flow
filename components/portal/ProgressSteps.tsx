import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ProgressStep { id: string; label: string; help?: string }

/**
 * Vertical progress for the client: finished steps ticked, the current one
 * highlighted with a line of plain-language help. Reads well on a phone.
 */
export function ProgressSteps({ steps, current }: { steps: ProgressStep[]; current: string }) {
  const at = steps.findIndex((s) => s.id === current)
  return (
    <ol className="space-y-0">
      {steps.map((s, i) => {
        const done = i < at
        const now = i === at
        return (
          <li key={s.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  done && 'bg-flow-green text-white',
                  now && 'bg-flow-lime text-flow-green ring-4 ring-flow-lime/40',
                  !done && !now && 'bg-muted text-muted-foreground',
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              {i < steps.length - 1 && <span className={cn('my-1 w-px flex-1', done ? 'bg-flow-green' : 'bg-border')} />}
            </div>
            <div className={cn('pb-5', i === steps.length - 1 && 'pb-0')}>
              <p className={cn('text-sm', now ? 'font-semibold' : done ? 'font-medium' : 'text-muted-foreground')}>
                {s.label}
              </p>
              {now && s.help && <p className="mt-0.5 text-sm text-muted-foreground">{s.help}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
