import { cn } from '@/lib/utils'

export interface RankRow {
  label: string
  value: number
  /** Shown at the end of the bar instead of the raw value (money, "3d", "42%"). */
  display?: string
  tone?: 'green' | 'lime' | 'warning' | 'danger' | 'muted'
}

const TONE = {
  green: 'bg-primary',
  lime: 'bg-flow-lime',
  warning: 'bg-warning',
  danger: 'bg-destructive',
  muted: 'bg-muted-foreground/40',
}

/** Horizontal bars scaled to the largest row: funnels, aging, days per stage. Plain markup, readable as text. */
export function RankBars({ rows, empty }: { rows: RankRow[]; empty: string }) {
  const max = Math.max(...rows.map((r) => r.value), 0)
  if (max === 0) return <p className="rounded-xl bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">{empty}</p>
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{r.label}</span>
            <bdi dir="ltr" className="font-display font-semibold">{r.display ?? r.value}</bdi>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
            <div className={cn('h-full rounded-full', TONE[r.tone ?? 'green'])} style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
