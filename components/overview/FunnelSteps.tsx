import { cn } from '@/lib/utils'

/**
 * A funnel: each step is a centred bar that narrows with the count, with the
 * share that made it from the step above in between. Plain markup, readable as text.
 */
export function FunnelSteps({ steps, empty }: { steps: { label: string; count: number }[]; empty: string }) {
  const top = steps[0]?.count ?? 0
  if (top === 0) return <p className="rounded-2xl bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">{empty}</p>
  return (
    <ol className="space-y-1.5">
      {steps.map((s, i) => {
        const pct = steps[i - 1]?.count ? Math.round((s.count / steps[i - 1].count) * 100) : null
        const last = i === steps.length - 1
        return (
          <li key={s.label}>
            {pct !== null && (
              <div className="flex justify-center py-0.5 text-[11px] text-muted-foreground">
                <bdi dir="ltr">↓ {pct}%</bdi>
              </div>
            )}
            <div
              className={cn(
                'mx-auto flex h-10 items-center justify-between gap-3 rounded-xl px-4 text-sm font-medium',
                last ? 'bg-flow-green text-flow-lime' : 'bg-flow-lime/70 text-flow-green',
              )}
              style={{ width: `${Math.max(34, (s.count / top) * 100)}%` }}
            >
              <span className="truncate">{s.label}</span>
              <bdi dir="ltr" className="font-display font-bold">{s.count}</bdi>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
