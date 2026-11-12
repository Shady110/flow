// Which monthly invoice is due today for a contract? Pure (no framework imports)
// so the rules are unit-tested with plain node. Reuses the deal helpers.
import { dealMonths, monthlyAt, type Deal } from './deals.ts'

export interface DueCycle {
  /** 1-based month of the contract. */
  month: number
  of: number
  /** First day of the month this cycle starts in; the unique billing_period key. */
  period: string
  /** Package name for this month ("Basic", "Premium"…). */
  plan: string
  monthly: number
  /** Extra one-time fee, charged on month 1 only. */
  oneTime: number
  dueDate: string
}

const iso = (d: Date) => d.toISOString().slice(0, 10)

/** start + n months, clamping the day (Jan 31 + 1 month = Feb 28). */
export function addMonths(startIso: string, n: number): string {
  const [y, m, d] = startIso.split('-').map(Number)
  const first = new Date(Date.UTC(y, m - 1 + n, 1))
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate()
  first.setUTCDate(Math.min(d, last))
  return iso(first)
}

/** Package name in force during contract month `month` (1-based), or null after the end. */
export function planAt(deal: Deal, month: number): string | null {
  let end = 0
  for (const p of deal.phases) {
    end += p.months
    if (month <= end) return p.plan
  }
  return null
}

/**
 * The cycle that is current on `today`: the latest monthly cycle whose start
 * date has passed. Null before the contract starts and after its last month.
 * Missed earlier months are NOT back-filled: only the current one is returned.
 */
export function currentCycle(startIso: string, deal: Deal, today: Date = new Date(), dueDays = 7): DueCycle | null {
  const t = iso(today)
  if (t < startIso) return null
  const [sy, sm] = startIso.split('-').map(Number)
  let m = (today.getUTCFullYear() - sy) * 12 + (today.getUTCMonth() + 1 - sm)
  if (addMonths(startIso, m) > t) m -= 1
  const month = m + 1
  const of = dealMonths(deal)
  const monthly = monthlyAt(deal, month)
  const plan = planAt(deal, month)
  if (monthly === null || plan === null) return null

  const cycleStart = addMonths(startIso, m)
  const due = new Date(`${cycleStart}T00:00:00Z`)
  due.setUTCDate(due.getUTCDate() + dueDays)
  return {
    month,
    of,
    period: `${cycleStart.slice(0, 7)}-01`,
    plan,
    monthly,
    oneTime: month === 1 ? (deal.one_time ?? 0) : 0,
    dueDate: iso(due),
  }
}

/** Invoice line items for a cycle (descriptions are stored text, kept in plain English). */
export function cycleLines(c: DueCycle): { description: string; quantity: number; unit_price: number }[] {
  const lines = [{ description: `${c.plan} plan: month ${c.month} of ${c.of}`, quantity: 1, unit_price: c.monthly }]
  if (c.oneTime > 0) lines.push({ description: 'One-time setup fee', quantity: 1, unit_price: c.oneTime })
  return lines
}
