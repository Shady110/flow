// Pure aggregation behind the CEO home: where everything sits in the pipeline,
// what needs attention, who carries what, and how budget compares to cost.
// No framework imports, so it is unit-tested with plain node (lib/overview.test.mjs).

/** Left to right, the same seven columns as the pipeline board. */
export const PIPELINE_COLUMNS = [
  'lead',
  'group_created',
  'paperwork',
  'platform_creation',
  'listing',
  'pushing',
  'managing',
] as const
export type PipelineColumn = (typeof PIPELINE_COLUMNS)[number]

export function pipelineCounts(input: {
  leads: { status: string }[]
  clients: { id: string; stage: string }[]
  platforms: { client_id: string; stage: string }[]
}): Record<PipelineColumn, number> {
  const counts = Object.fromEntries(PIPELINE_COLUMNS.map((c) => [c, 0])) as Record<PipelineColumn, number>
  for (const l of input.leads) if (l.status !== 'won' && l.status !== 'lost') counts.lead++
  const stageOf = new Map(input.clients.map((c) => [c.id, c.stage]))
  for (const c of input.clients) {
    if (c.stage === 'group_created' || c.stage === 'paperwork') counts[c.stage]++
  }
  // A client is one card while onboarding, then one card per marketplace account.
  for (const p of input.platforms) {
    if (stageOf.get(p.client_id) === 'onboarded' && p.stage in counts) counts[p.stage as PipelineColumn]++
  }
  return counts
}

export type AttentionKind =
  | 'contract_unsigned'
  | 'documents_to_review'
  | 'listing_stuck'
  | 'ticket_urgent'
  | 'ticket_unassigned'
  | 'invoice_overdue'
  | 'task_overdue'

export interface AttentionItem {
  kind: AttentionKind
  severity: 'high' | 'medium' | 'low'
  clientId: string | null
  /** Used in the sentence: a count, a ticket number, an invoice number, a title… */
  detail: string
  ageDays: number
  href: string
}

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 } as const
const MS_DAY = 86_400_000

export const daysSince = (iso: string | null | undefined, now: Date): number =>
  iso ? Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / MS_DAY)) : 0

/** Days a Listing account may sit with deliverables missing before it counts as stuck. */
export const LISTING_STUCK_DAYS = 5

export function needsAttention(
  input: {
    contractsSent: { client_id: string; sent_at: string | null }[]
    documentsSubmitted: { client_id: string }[]
    listing: { client_id: string; id: string; updated_at: string; missing: number }[]
    tickets: { id: string; number: string; client_id: string; priority: string; assignee_id: string | null; created_at: string }[]
    invoices: { id: string; number: string; client_id: string; due_date: string | null; balance: number }[]
    tasks: { id: string; title: string; client_id: string; due_date: string | null }[]
  },
  now: Date = new Date(),
  limit = 8,
): AttentionItem[] {
  const out: AttentionItem[] = []

  for (const c of input.contractsSent) {
    out.push({ kind: 'contract_unsigned', severity: 'medium', clientId: c.client_id, detail: '', ageDays: daysSince(c.sent_at, now), href: `/clients/${c.client_id}` })
  }

  const docsByClient = new Map<string, number>()
  for (const d of input.documentsSubmitted) docsByClient.set(d.client_id, (docsByClient.get(d.client_id) ?? 0) + 1)
  for (const [clientId, n] of docsByClient) {
    out.push({ kind: 'documents_to_review', severity: 'medium', clientId, detail: String(n), ageDays: 0, href: `/clients/${clientId}` })
  }

  for (const p of input.listing) {
    const age = daysSince(p.updated_at, now)
    if (p.missing > 0 && age >= LISTING_STUCK_DAYS) {
      out.push({ kind: 'listing_stuck', severity: age >= 14 ? 'high' : 'medium', clientId: p.client_id, detail: String(p.missing), ageDays: age, href: `/content/${p.id}` })
    }
  }

  for (const t of input.tickets) {
    const urgent = t.priority === 'urgent' || t.priority === 'high'
    if (urgent) {
      out.push({ kind: 'ticket_urgent', severity: t.priority === 'urgent' ? 'high' : 'medium', clientId: t.client_id, detail: t.number, ageDays: daysSince(t.created_at, now), href: `/accounts/tickets/${t.id}` })
    } else if (!t.assignee_id) {
      out.push({ kind: 'ticket_unassigned', severity: 'low', clientId: t.client_id, detail: t.number, ageDays: daysSince(t.created_at, now), href: `/accounts/tickets/${t.id}` })
    }
  }

  const today = now.toISOString().slice(0, 10)
  for (const i of input.invoices) {
    if (i.balance > 0 && i.due_date && i.due_date < today) {
      const age = daysSince(i.due_date, now)
      out.push({ kind: 'invoice_overdue', severity: age >= 14 ? 'high' : 'medium', clientId: i.client_id, detail: i.number, ageDays: age, href: `/finance/invoices/${i.id}` })
    }
  }

  for (const t of input.tasks) {
    if (t.due_date && t.due_date < today) {
      out.push({ kind: 'task_overdue', severity: 'low', clientId: t.client_id, detail: t.title, ageDays: daysSince(t.due_date, now), href: `/tasks/${t.id}` })
    }
  }

  return out
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.ageDays - a.ageDays)
    .slice(0, limit)
}

export interface WorkloadRow {
  id: string
  name: string
  role: string | null
  leads: number
  /** Accounts waiting on Content — only filled for the content director. */
  contentQueue: number
  accounts: number
  tickets: number
  tasks: number
  total: number
}

export function workloadByPerson(input: {
  team: { id: string; name: string; role: string | null }[]
  leads: { owner_id: string | null; status: string }[]
  platforms: { stage: string; account_manager_id: string | null }[]
  tickets: { assignee_id: string | null }[]
  tasks: { assignee_ids: string[] }[]
  /** Accounts at Listing right now (a shared queue, owned by the content director). */
  listingCount: number
}): WorkloadRow[] {
  const count = <T>(rows: T[], pick: (r: T) => boolean) => rows.filter(pick).length
  return input.team
    .map((m) => {
      const leads = count(input.leads, (l) => l.owner_id === m.id && l.status !== 'won' && l.status !== 'lost')
      const accounts = count(input.platforms, (p) => p.account_manager_id === m.id && (p.stage === 'pushing' || p.stage === 'managing'))
      const tickets = count(input.tickets, (t) => t.assignee_id === m.id)
      const tasks = count(input.tasks, (t) => t.assignee_ids.includes(m.id))
      const contentQueue = m.role === 'content-director' ? input.listingCount : 0
      return { id: m.id, name: m.name, role: m.role, leads, contentQueue, accounts, tickets, tasks, total: leads + contentQueue + accounts + tickets + tasks }
    })
    .sort((a, b) => b.total - a.total)
}

/** What active clients will spend vs what we expect it to cost us. */
export function budgetVsCost(clients: { status: string; budget: number | null; estimated_cost: number | null }[]) {
  let budget = 0
  let cost = 0
  for (const c of clients) {
    if (c.status === 'churned') continue
    budget += Number(c.budget ?? 0)
    cost += Number(c.estimated_cost ?? 0)
  }
  const margin = budget - cost
  return { budget, cost, margin, marginPct: budget > 0 ? Math.round((margin / budget) * 100) : null }
}

/** "3 hours ago" / "yesterday" in the viewer's language. */
export function relativeTime(iso: string, locale: string, now: Date = new Date()): string {
  const seconds = (new Date(iso).getTime() - now.getTime()) / 1000
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ]
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return rtf.format(0, 'minute')
}
