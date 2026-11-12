// Turns a contract template + a client's deal into the final contract text.
// Pure module (no framework imports) so it is unit-tested with plain node.
import { dealMonths, dealTotal, type Deal } from './deals.ts'

export type ContractLocale = 'en' | 'ar'

/** Placeholders a template may use, in the order shown in the editor's cheat-sheet. */
export const PLACEHOLDERS = [
  'client_name',
  'company',
  'contact_name',
  'platforms',
  'start_date',
  'months',
  'phases_table',
  'total',
  'today',
] as const

export interface ContractVars {
  locale: ContractLocale
  client_name: string
  company: string
  contact_name: string
  /** Display names, e.g. ["Amazon", "Noon"]. */
  platforms: string[]
  start_date: string
  today: string
  deal: Deal
}

const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 })

const WORDS = {
  en: {
    currency: 'EGP',
    month: (a: number, b: number) => (a === b ? `Month ${a}` : `Months ${a}–${b}`),
    line: (months: string, plan: string, monthly: string, subtotal: string) =>
      `${months}: ${plan} — ${monthly} per month (${subtotal})`,
    oneTime: (amount: string) => `One-time fee: ${amount}`,
    and: ' & ',
  },
  ar: {
    currency: 'ج.م',
    month: (a: number, b: number) => (a === b ? `الشهر ${a}` : `الأشهر ${a}–${b}`),
    line: (months: string, plan: string, monthly: string, subtotal: string) =>
      `${months}: باقة ${plan} — ${monthly} شهريًا (${subtotal})`,
    oneTime: (amount: string) => `رسوم لمرة واحدة: ${amount}`,
    and: ' و',
  },
} as const

/** How each marketplace is written inside a contract, per language. */
export const PLATFORM_NAMES: Record<ContractLocale, Record<string, string>> = {
  en: { amazon: 'Amazon', noon: 'Noon', jumia: 'Jumia' },
  ar: { amazon: 'أمازون', noon: 'نون', jumia: 'جوميا' },
}

/** One line per phase: "Months 1–3: Basic — 2,500 EGP per month (7,500 EGP)". */
export function phasesTable(deal: Deal, locale: ContractLocale): string {
  const w = WORDS[locale]
  let from = 1
  const lines = deal.phases.map((p) => {
    const to = from + p.months - 1
    const line = w.line(
      w.month(from, to),
      p.plan,
      `${fmt(p.monthly)} ${w.currency}`,
      `${fmt(p.months * p.monthly)} ${w.currency}`,
    )
    from = to + 1
    return line
  })
  if (deal.one_time) lines.push(w.oneTime(`${fmt(deal.one_time)} ${w.currency}`))
  return lines.join('\n')
}

/**
 * Fill `{{placeholders}}`. Anything that can't be filled (unknown name, or a
 * known one with an empty value) is left in the text and listed in `unresolved`
 * so the composer can warn and the server can refuse to send a half-made contract.
 */
export function renderContract(
  body: string,
  vars: ContractVars,
): { text: string; unresolved: string[] } {
  const w = WORDS[vars.locale]
  const values: Record<string, string> = {
    client_name: vars.client_name,
    company: vars.company,
    contact_name: vars.contact_name,
    platforms: vars.platforms.join(w.and),
    start_date: vars.start_date,
    months: String(dealMonths(vars.deal)),
    phases_table: phasesTable(vars.deal, vars.locale),
    total: `${fmt(dealTotal(vars.deal))} ${w.currency}`,
    today: vars.today,
  }
  const unresolved = new Set<string>()
  const text = body.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (whole, key: string) => {
    const v = values[key]
    if (!v) {
      unresolved.add(key)
      return whole
    }
    return v
  })
  return { text, unresolved: [...unresolved] }
}

/** Placeholders still present in already-rendered text (used by the server before sending). */
export function leftoverPlaceholders(text: string): string[] {
  return [...new Set([...text.matchAll(/\{\{\s*([a-z_]+)\s*\}\}/g)].map((m) => m[1]))]
}
