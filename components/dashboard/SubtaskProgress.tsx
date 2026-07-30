/** Subtask completion bar — server-safe, no client JS. */
export function SubtaskProgress({ done, total }: { done: number; total: number }) {
  if (total === 0) return null
  const pct = Math.round((done / total) * 100)
  return (
    <div className="space-y-1.5">
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-flow-lime transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">
        {done} of {total} done ({pct}%)
      </p>
    </div>
  )
}
