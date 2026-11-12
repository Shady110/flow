// What a client agreed to: which marketplaces, for how long, and at what price
// per stretch of months ("3 months on Basic, then 3 on Premium"). Stored as
// jsonb on leads.deal / clients.deal / contracts.terms. Pure module — no
// framework imports — so it can be unit-tested with plain node.

export interface DealPhase {
  /** Package name, free text (e.g. "Basic", "Premium", "Custom"). */
  plan: string
  months: number
  /** Price per month during this phase, in EGP. */
  monthly: number
}

export interface Deal {
  platforms: string[]
  phases: DealPhase[]
  /** Optional fee charged once (e.g. account setup). */
  one_time?: number
}

export function dealMonths(deal: Deal): number {
  return deal.phases.reduce((s, p) => s + p.months, 0)
}

export function dealTotal(deal: Deal): number {
  return deal.phases.reduce((s, p) => s + p.months * p.monthly, 0) + (deal.one_time ?? 0)
}

/** The monthly price for the Nth month of the contract (1-based); null after it ends. */
export function monthlyAt(deal: Deal, month: number): number | null {
  let end = 0
  for (const p of deal.phases) {
    end += p.months
    if (month <= end) return p.monthly
  }
  return null
}

/** Defensive read of a jsonb value; returns null unless it is a usable deal. */
export function parseDeal(value: unknown): Deal | null {
  if (!value || typeof value !== 'object') return null
  const v = value as Partial<Deal>
  if (!Array.isArray(v.phases) || v.phases.length === 0) return null
  const phases = v.phases.map((p) => ({
    plan: String(p?.plan ?? ''),
    months: Number(p?.months),
    monthly: Number(p?.monthly),
  }))
  if (phases.some((p) => !(p.months >= 1) || !Number.isInteger(p.months) || !(p.monthly >= 0))) return null
  return {
    platforms: Array.isArray(v.platforms) ? v.platforms.map(String) : [],
    phases,
    ...(v.one_time ? { one_time: Number(v.one_time) } : {}),
  }
}
