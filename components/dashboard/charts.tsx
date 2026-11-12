'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

/** 92500 → "92.5K", so large money axes don't get clipped. */
const compact = (v: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(v)

export interface Slice {
  label: string
  value: number
}

export function StatusDonut({ data }: { data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) {
    return (
      <div className="flex h-full min-h-[180px] items-center justify-center text-sm text-muted-foreground">
        No data yet
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius={58}
          outerRadius={82}
          paddingAngle={4}
          cornerRadius={8}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: 14,
            border: 'none',
            boxShadow: 'var(--shadow-md)',
            background: 'var(--popover)',
            color: 'var(--popover-foreground)',
            fontSize: 12,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export interface BarDatum {
  name: string
  [key: string]: string | number
}

export function GroupedBars({
  data,
  bars,
}: {
  data: BarDatum[]
  bars: { key: string; color: string; label: string }[]
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-[220px] items-center justify-center text-sm text-muted-foreground">
        No data yet
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={6} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="2 6" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tickFormatter={compact} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          cursor={{ fill: 'var(--muted)', radius: 12 }}
          contentStyle={{
            borderRadius: 14,
            border: 'none',
            boxShadow: 'var(--shadow-md)',
            background: 'var(--popover)',
            color: 'var(--popover-foreground)',
            fontSize: 12,
          }}
        />
        {bars.map((b) => (
          <Bar key={b.key} dataKey={b.key} name={b.label} fill={b.color} radius={[12, 12, 12, 12]} maxBarSize={18} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
