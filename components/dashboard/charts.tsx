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
          innerRadius={55}
          outerRadius={80}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: '1px solid var(--border)',
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
      <BarChart data={data} barGap={4}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={28} />
        <Tooltip
          cursor={{ fill: 'var(--muted)' }}
          contentStyle={{
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--popover)',
            color: 'var(--popover-foreground)',
            fontSize: 12,
          }}
        />
        {bars.map((b) => (
          <Bar key={b.key} dataKey={b.key} name={b.label} fill={b.color} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
