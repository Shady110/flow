/** Series behind the CEO overview's charts. Pure functions, tested in overview-trends.test.mjs. */

const DAY = 86_400_000

/** First day of the month `back` months before `now`. */
const monthStart = (now: Date, back: number) => new Date(now.getFullYear(), now.getMonth() - back, 1)

/** How many rows were created in each of the last `months` months, oldest first. */
export function monthlyCounts(
  rows: { created_at: string }[],
  now: Date,
  locale = 'en',
  months = 6,
): { name: string; count: number }[] {
  const out = Array.from({ length: months }, (_, i) => {
    const d = monthStart(now, months - 1 - i)
    return { key: d.getFullYear() * 12 + d.getMonth(), name: d.toLocaleDateString(locale, { month: 'short' }), count: 0 }
  })
  for (const r of rows) {
    const d = new Date(r.created_at)
    const bucket = out.find((b) => b.key === d.getFullYear() * 12 + d.getMonth())
    if (bucket) bucket.count += 1
  }
  return out.map(({ name, count }) => ({ name, count }))
}

/** Latest value against the one before it. `pct` is null when there is nothing to compare with. */
export function changeVsLast(series: number[]): { delta: number; pct: number | null } {
  const last = series[series.length - 1] ?? 0
  const prev = series[series.length - 2] ?? 0
  return { delta: last - prev, pct: prev > 0 ? Math.round(((last - prev) / prev) * 100) : null }
}

const LEAD_ORDER = ['new', 'contacted', 'qualified', 'proposal', 'won']

/** How many leads got at least as far as each step, plus the share that ended up won. Lost leads count as "new" only. */
export function leadFunnel(leads: { status: string }[]): { steps: { key: string; count: number }[]; winRate: number | null; lost: number } {
  const rank = (s: string) => LEAD_ORDER.indexOf(s)
  const steps = LEAD_ORDER.map((key, i) => ({ key, count: leads.filter((l) => (i === 0 ? true : rank(l.status) >= i)).length }))
  const total = steps[0].count
  return { steps, winRate: total > 0 ? Math.round((steps[steps.length - 1].count / total) * 100) : null, lost: leads.filter((l) => l.status === 'lost').length }
}

export interface AgingBuckets {
  current: number
  late1to7: number
  late8to14: number
  late15plus: number
}

/** What clients owe, by how late it is. "Current" = not yet due (or no due date). Edges: 7 days late is in 1-7, 8 in 8-14, 14 in 8-14, 15 in 15+. */
export function agingBuckets(invoices: { status: string; balance: number; due_date: string | null }[], now: Date): AgingBuckets {
  const out: AgingBuckets = { current: 0, late1to7: 0, late8to14: 0, late15plus: 0 }
  for (const i of invoices) {
    if (i.status !== 'sent' || i.balance <= 0) continue
    const late = i.due_date ? Math.floor((now.getTime() - new Date(i.due_date).getTime()) / DAY) : 0
    if (late <= 0) out.current += i.balance
    else if (late <= 7) out.late1to7 += i.balance
    else if (late <= 14) out.late8to14 += i.balance
    else out.late15plus += i.balance
  }
  return out
}

/** Open tickets per priority, always in the order urgent, high, normal, low. */
export function ticketsByPriority(tickets: { priority: string }[]): { key: string; count: number }[] {
  return ['urgent', 'high', 'normal', 'low'].map((key) => ({ key, count: tickets.filter((t) => t.priority === key).length }))
}

/**
 * Average days platform accounts spend in each stage, from the stage history.
 * A stage still open runs until `now`; stages nobody has been in are omitted.
 */
export function stageDwell(
  events: { platform_id: string | null; to_stage: string; created_at: string }[],
  platforms: { id: string; stage: string }[],
  now: Date,
): Record<string, number> {
  const spent: Record<string, number[]> = {}
  for (const p of platforms) {
    const mine = events
      .filter((e) => e.platform_id === p.id)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
    mine.forEach((e, i) => {
      const end = mine[i + 1] ? new Date(mine[i + 1].created_at) : e.to_stage === p.stage ? now : null
      if (!end) return
      const days = Math.max(0, (end.getTime() - new Date(e.created_at).getTime()) / DAY)
      ;(spent[e.to_stage] ??= []).push(days)
    })
  }
  return Object.fromEntries(
    Object.entries(spent).map(([stage, d]) => [stage, Math.round((d.reduce((s, x) => s + x, 0) / d.length) * 10) / 10]),
  )
}

/** Where leads come from, biggest first, with how many of each source were won. Missing source counts as "unknown". */
export function leadSources(leads: { source: string | null; status: string }[]): { key: string; count: number; won: number }[] {
  const by = new Map<string, { key: string; count: number; won: number }>()
  for (const l of leads) {
    const key = (l.source ?? '').trim().toLowerCase() || 'unknown'
    const row = by.get(key) ?? { key, count: 0, won: 0 }
    row.count += 1
    if (l.status === 'won') row.won += 1
    by.set(key, row)
  }
  return [...by.values()].sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
}

export interface ClientRow {
  id: string
  name: string
  /** A pipeline column key: group_created, paperwork, or the furthest marketplace stage. */
  stage: string
  owed: number
  lateDays: number
  status: 'late' | 'review' | 'risk' | 'ok'
}

const STAGE_ORDER = ['platform_creation', 'listing', 'pushing', 'managing']

/**
 * One row per client for the CEO home: where they are, what they owe, and why they need attention
 * (late invoice first, then documents to review, then an at-risk account). Worst first.
 */
export function clientRows(
  input: {
    clients: { id: string; name: string; status: string; stage: string }[]
    platforms: { client_id: string; stage: string; account_status: string }[]
    invoices: { client_id: string; status: string; balance: number; due_date: string | null }[]
    reviewClientIds: string[]
  },
  now: Date,
): ClientRow[] {
  const rank = { late: 0, review: 1, risk: 2, ok: 3 }
  return input.clients
    .filter((c) => c.status !== 'churned')
    .map((c) => {
      const mine = input.platforms.filter((p) => p.client_id === c.id)
      const stage =
        c.stage === 'group_created' || c.stage === 'paperwork'
          ? c.stage
          : (STAGE_ORDER.filter((s) => mine.some((p) => p.stage === s)).pop() ?? 'platform_creation')
      const open = input.invoices.filter((i) => i.client_id === c.id && i.status === 'sent' && i.balance > 0)
      const owed = open.reduce((s, i) => s + i.balance, 0)
      const lateDays = Math.max(0, ...open.map((i) => (i.due_date ? Math.floor((now.getTime() - new Date(i.due_date).getTime()) / DAY) : 0)))
      const status: ClientRow['status'] =
        lateDays > 0 ? 'late' : input.reviewClientIds.includes(c.id) ? 'review' : mine.some((p) => p.account_status === 'at_risk' || p.account_status === 'suspended') ? 'risk' : 'ok'
      return { id: c.id, name: c.name, stage, owed, lateDays, status }
    })
    .sort((a, b) => rank[a.status] - rank[b.status] || b.lateDays - a.lateDays || b.owed - a.owed || a.name.localeCompare(b.name))
}
