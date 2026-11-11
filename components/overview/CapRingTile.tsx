import { Card } from '@/components/ds/card'
import { AnimatedCircularProgressBar } from '@/components/ds/animated-circular-progress-bar'
import { cn } from '@/lib/utils'

/** The monthly client limit as a ring: how much of the cap is used, with the numbers beside it. */
export function CapRingTile({
  label,
  won,
  cap,
  note,
  full,
}: {
  label: string
  won: number
  cap: number
  note: string
  full: boolean
}) {
  return (
    <Card className="h-full gap-0 p-4 sm:p-5">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="mt-3 flex items-center gap-4">
        <AnimatedCircularProgressBar
          value={cap > 0 ? Math.min(won, cap) : 0}
          max={cap > 0 ? cap : 1}
          gaugePrimaryColor={full ? 'var(--warning, #b45309)' : 'var(--ink-green)'}
          gaugeSecondaryColor="var(--ink-track)"
          className="size-20 shrink-0 text-base"
        />
        <div className="min-w-0">
          <p className="font-display text-3xl font-bold leading-none tracking-tight">
            <bdi dir="ltr">{won} / {cap}</bdi>
          </p>
          <p className={cn('mt-2 text-xs font-medium', full ? 'text-warning' : 'text-muted-foreground')}>{note}</p>
        </div>
      </div>
    </Card>
  )
}
