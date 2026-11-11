'use client'

import { useReducedMotion } from 'framer-motion'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { VIZ } from './palette'

const RING = [VIZ.ink, VIZ.leaf, VIZ.lime, VIZ.mid, VIZ.mint]


/** The hover card used by every chart: month, then one dot-and-value row per series. */
function HoverCard({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean
  payload?: { name?: string; value?: number; color?: string; fill?: string }[]
  label?: string
  format: (n: number) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-card px-3 py-2 text-xs shadow-[var(--shadow-md)] ring-1 ring-border/60">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color ?? p.fill }} />
          {p.name}
          <bdi dir="ltr" className="ms-auto ps-3 font-semibold text-foreground">{format(Number(p.value ?? 0))}</bdi>
        </p>
      ))}
    </div>
  )
}

/** A strip of small columns inside a stat tile: the latest month is solid, earlier months faded. Reads fine even when most months are 0. */
export function MiniBars({ data, color = VIZ.ink, soft = VIZ.leaf, label }: { data: number[]; color?: string; /** Colour of the earlier months. */ soft?: string; label: string }) {
  const reduced = useReducedMotion()
  if (data.length < 2) return null
  return (
    <div role="img" aria-label={label} className="h-11 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.map((v, i) => ({ i, v }))} margin={{ top: 2, right: 0, bottom: 0, left: 0 }} barCategoryGap="22%">
          <Bar dataKey="v" radius={[5, 5, 2, 2]} minPointSize={3} isAnimationActive={!reduced}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === data.length - 1 ? color : soft} fillOpacity={i === data.length - 1 ? 1 : 0.6} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export interface DonutSlice {
  label: string
  value: number
  color?: string
}

/** A donut with the total in the middle and a legend (dot, name, count, share) beside it. */
export function DonutChart({
  data,
  centerLabel,
  empty,
  format = (n) => String(n),
}: {
  data: DonutSlice[]
  centerLabel: string
  empty: string
  format?: (n: number) => string
}) {
  const reduced = useReducedMotion()
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) {
    return <div className="flex min-h-[160px] items-center justify-center rounded-2xl bg-muted/50 text-sm text-muted-foreground">{empty}</div>
  }
  const colored = data.map((d, i) => ({ ...d, color: d.color ?? RING[i % RING.length] }))
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative h-44 w-44 shrink-0" role="img" aria-label={`${centerLabel}: ${total}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={colored} dataKey="value" nameKey="label" innerRadius={58} outerRadius={82} paddingAngle={3} cornerRadius={9} stroke="none" isAnimationActive={!reduced}>
              {colored.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<HoverCard format={format} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <bdi dir="ltr" className="font-display text-3xl font-bold leading-none">{format(total)}</bdi>
          <span className="mt-1 text-[11px] text-muted-foreground">{centerLabel}</span>
        </div>
      </div>
      <ul className="w-full min-w-0 flex-1 space-y-2.5">
        {colored.map((d) => (
          <li key={d.label} className="flex items-center gap-3 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">{d.label}</span>
            <bdi dir="ltr" className="font-display font-semibold">{format(d.value)}</bdi>
            <bdi dir="ltr" className="w-10 text-end text-xs text-muted-foreground">{Math.round((d.value / total) * 100)}%</bdi>
          </li>
        ))}
      </ul>
    </div>
  )
}

