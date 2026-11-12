import { cn } from '@/lib/utils'

export interface ColumnDatum {
  name: string
  [key: string]: string | number
}

const compact = (v: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(v)

/**
 * Month-by-month columns, drawn as plain markup so every bar keeps its colour and the
 * numbers stay readable text: rounded columns on a soft track, the value on top, the
 * latest month solid and earlier months soft, a hover card with every series' value.
 */
export function ColumnChart({
  data,
  series,
  label,
  format = compact,
  height = 230,
  empty,
  tone = 'light',
}: {
  data: ColumnDatum[]
  /** `color` is the latest month; `soft` the earlier ones. */
  series: { key: string; color: string; soft: string; label: string }[]
  label: string
  format?: (n: number) => string
  height?: number
  empty: string
  /** `dark` for use on the deep green hero card. */
  tone?: 'light' | 'dark'
}) {
  const values = data.flatMap((d) => series.map((s) => Number(d[s.key] ?? 0)))
  const max = Math.max(0, ...values)
  const dark = tone === 'dark'
  if (max === 0) {
    return (
      <div className={cn('flex items-center justify-center rounded-2xl text-sm', dark ? 'bg-white/5 text-white/70' : 'bg-muted/50 text-muted-foreground')} style={{ height }}>
        {empty}
      </div>
    )
  }
  return (
    <div role="img" aria-label={label} className="flex items-stretch gap-1.5 sm:gap-2.5" style={{ height }}>
      {data.map((d, i) => {
        const latest = i === data.length - 1
        return (
          <div key={`${d.name}-${i}`} className="group relative flex min-w-0 flex-1 flex-col">
            <div className={cn('flex flex-1 items-end justify-center gap-1 rounded-2xl px-1 pt-6', dark ? 'bg-white/[0.06]' : 'bg-muted/50')}>
              {series.map((s) => {
                const v = Number(d[s.key] ?? 0)
                return (
                  <div key={s.key} className="relative flex h-full w-full max-w-[22px] items-end">
                    {v > 0 && (
                      <>
                        <bdi dir="ltr" className={cn('absolute inset-x-0 text-center text-[11px]', dark ? 'text-white/70' : 'text-muted-foreground')} style={{ bottom: `calc(${(v / max) * 100}% + 4px)` }}>
                          {format(v)}
                        </bdi>
                        <div
                          className="col-grow w-full rounded-t-[10px] rounded-b-[4px]"
                          style={{ height: `${Math.max(4, (v / max) * 100)}%`, background: latest ? s.color : s.soft }}
                        />
                      </>
                    )}
                  </div>
                )
              })}
            </div>
            <span className={cn('mt-2 text-center text-xs', latest ? (dark ? 'font-medium text-flow-lime' : 'font-medium text-foreground') : dark ? 'text-white/60' : 'text-muted-foreground')}>{d.name}</span>
            <div className="pointer-events-none invisible absolute start-1/2 top-0 z-10 w-max -translate-x-1/2 rounded-xl bg-card px-3 py-2 text-xs opacity-0 shadow-[var(--shadow-md)] ring-1 ring-border/60 transition-opacity group-hover:visible group-hover:opacity-100">
              <p className="mb-1 font-medium">{d.name}</p>
              {series.map((s) => (
                <p key={s.key} className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.label}
                  <bdi dir="ltr" className="ms-auto ps-3 font-semibold text-foreground">{format(Number(d[s.key] ?? 0))}</bdi>
                </p>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
