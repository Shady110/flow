/**
 * The rate card and the custom-package calculator. One pure function, two front
 * doors: the landing-page package builder calls it in the browser, and the
 * website chatbot calls it server-side as a Gemini tool.
 *
 * The point of the second one: an LLM asked to price a bundle will happily
 * invent a plausible total. It never does the arithmetic here — it collects the
 * inputs, calls this, and narrates the result.
 *
 * The landing pricing section (`data/landing-content.ts` -> `landing_content`)
 * owns *presentation*: labels, feature bullets, compare-at framing, badges. It
 * stores prices as display strings inside an editable JSONB blob, which is fine
 * for rendering and useless for arithmetic. The constants below are the
 * arithmetic, and `scripts/check.ts` asserts they still agree with the shipped
 * landing defaults so the two cannot silently diverge.
 *
 * ponytail: that guard covers the in-code defaults only. An editor changing a
 * price in /internal/settings/landing can still desync this file from what the
 * cards display. Wire an editor-side warning if that ever actually happens.
 *
 * No `server-only` import and no `@/` alias on purpose: this must stay
 * importable both from a client component and from scripts/check.ts running
 * under bare node. Keep it pure — no fetching, no dates, no randomness.
 */

/** All FLOW pricing is in Egyptian Pounds. */
export const CURRENCY = 'EGP' as const

/** One-time, per-item content work (the "Content" pricing tab). */
export const CONTENT_RATES = {
  /** Listing copy only. */
  listing: 10,
  /** Studio photography only. */
  photography: 30,
  /** Both, briefed as one job — cheaper than buying the two separately. */
  full: 35,
} as const

/** Monthly seller-account management without bundled content (the "Account" tab). */
export const ACCOUNT_PLANS = [
  { serviceKey: 'account-basic', name: 'Basic', monthly: 2500, salesShare: 1 },
  { serviceKey: 'account-premium', name: 'Premium', monthly: 5000, salesShare: 2 },
] as const

export interface GrowthTier {
  serviceKey: string
  name: string
  monthly: number
  /** Products included in the monthly fee. */
  productCap: number
  /** Starting share of sales, in percent. */
  salesShareFrom: number
  /** Ceiling the share can escalate to; equal to `salesShareFrom` when fixed. */
  salesShareCap: number
  /** Reduced per-item rate for products beyond `productCap`. */
  extraItemRate: number
}

/**
 * All-in monthly plans (the "Full Growth" tab): content + photography + account
 * management bundled. Ordered smallest cap first — `growthTierFor()` relies on
 * that to pick the first tier that fits.
 */
export const GROWTH_TIERS: readonly GrowthTier[] = [
  {
    serviceKey: 'growth-starter',
    name: 'Starter',
    monthly: 3500,
    productCap: 50,
    salesShareFrom: 1,
    salesShareCap: 1, // flat: Starter's share never escalates
    extraItemRate: 35,
  },
  {
    serviceKey: 'growth',
    name: 'Growth',
    monthly: 8000,
    productCap: 150,
    salesShareFrom: 2,
    salesShareCap: 5,
    extraItemRate: 25,
  },
  {
    serviceKey: 'growth-scale',
    name: 'Scale',
    monthly: 16000,
    productCap: 400,
    salesShareFrom: 2.5,
    salesShareCap: 5,
    extraItemRate: 20,
  },
]

export const NEEDS = ['photography', 'listing', 'accountManagement'] as const
export type Need = (typeof NEEDS)[number]

export interface QuoteInput {
  /** How many products the seller wants covered. */
  productCount: number
  needs: Need[]
  /** Marketplaces the seller is on. Informational — it does not move the price. */
  platforms?: string[]
}

export interface QuoteLine {
  /** Stable identifier; each consumer supplies its own localized label. */
  key:
    | 'content-listing'
    | 'content-photography'
    | 'content-full'
    | 'account-monthly'
    | 'growth-monthly'
    | 'growth-extra-items'
  qty: number
  /** Unit price in EGP. */
  rate: number
  /** qty * rate, in EGP. */
  total: number
  /** Whether this line repeats every month or is billed once. */
  recurring: boolean
}

export interface Quote {
  /** A `SERVICE_OPTIONS` value — feeds `?plan=` and `leads.plan_interest`. */
  serviceKey: string
  /** Human-facing plan name as it appears on the pricing cards. */
  planName: string
  /** Which pricing model was selected. */
  model: 'content' | 'account' | 'growth' | 'none'
  currency: typeof CURRENCY
  /** Total billed once, up front. */
  oneTime: number
  /** Total billed every month. */
  monthly: number
  /**
   * Share of managed sales, in percent, on top of `monthly`. `from` and `cap`
   * are equal when the share is fixed and cannot escalate.
   */
  salesShare: { from: number; cap: number } | null
  /** Products beyond the plan's included count, if any. */
  overage: { count: number; rate: number; total: number } | null
  lines: QuoteLine[]
}

/** Products beyond this are a bespoke conversation, not a calculator result. */
const MAX_PRODUCTS = 100_000

const line = (
  key: QuoteLine['key'],
  qty: number,
  rate: number,
  recurring: boolean,
): QuoteLine => ({ key, qty, rate, total: qty * rate, recurring })

/**
 * Pick the smallest growth tier whose product cap covers the catalogue. Falls
 * back to the largest tier — over its cap the extra items are simply billed at
 * that tier's reduced rate, which is exactly what the pricing page promises.
 */
export function growthTierFor(productCount: number): GrowthTier {
  return (
    GROWTH_TIERS.find((t) => productCount <= t.productCap) ??
    GROWTH_TIERS[GROWTH_TIERS.length - 1]
  )
}

export function quote(input: QuoteInput): Quote {
  const productCount = Math.min(
    MAX_PRODUCTS,
    Math.max(0, Math.floor(input.productCount) || 0),
  )
  const needs = new Set(input.needs ?? [])
  const wantsPhotography = needs.has('photography')
  const wantsListing = needs.has('listing')
  const wantsAccount = needs.has('accountManagement')
  const wantsContent = wantsPhotography || wantsListing

  const empty: Quote = {
    serviceKey: 'not-sure',
    planName: '',
    model: 'none',
    currency: CURRENCY,
    oneTime: 0,
    monthly: 0,
    salesShare: null,
    overage: null,
    lines: [],
  }

  if (!wantsContent && !wantsAccount) return empty

  // ── Content + account management → an all-in growth plan ──────────────────
  // This is the bundle the growth tab exists for: buying the two separately
  // always costs more than the plan that contains both.
  if (wantsContent && wantsAccount) {
    const tier = growthTierFor(productCount)
    const extraCount = Math.max(0, productCount - tier.productCap)
    const extraTotal = extraCount * tier.extraItemRate

    return {
      serviceKey: tier.serviceKey,
      planName: tier.name,
      model: 'growth',
      currency: CURRENCY,
      oneTime: 0,
      monthly: tier.monthly + extraTotal,
      salesShare: { from: tier.salesShareFrom, cap: tier.salesShareCap },
      overage: extraCount
        ? { count: extraCount, rate: tier.extraItemRate, total: extraTotal }
        : null,
      lines: [
        line('growth-monthly', 1, tier.monthly, true),
        ...(extraCount
          ? [line('growth-extra-items', extraCount, tier.extraItemRate, true)]
          : []),
      ],
    }
  }

  // ── Account management alone → monthly fee, content billed separately ─────
  if (wantsAccount) {
    // Heuristic, not a rule: a catalogue past the Starter product cap has
    // enough moving parts (FBA, PO's, price analysis) to need the deeper tier.
    const plan = productCount > GROWTH_TIERS[0].productCap ? ACCOUNT_PLANS[1] : ACCOUNT_PLANS[0]
    return {
      serviceKey: plan.serviceKey,
      planName: plan.name,
      model: 'account',
      currency: CURRENCY,
      oneTime: 0,
      monthly: plan.monthly,
      salesShare: { from: plan.salesShare, cap: plan.salesShare },
      overage: null,
      lines: [line('account-monthly', 1, plan.monthly, true)],
    }
  }

  // ── Content alone → one-time, per item ────────────────────────────────────
  const both = wantsPhotography && wantsListing
  const rate = both
    ? CONTENT_RATES.full
    : wantsPhotography
      ? CONTENT_RATES.photography
      : CONTENT_RATES.listing
  const key = both
    ? ('content-full' as const)
    : wantsPhotography
      ? ('content-photography' as const)
      : ('content-listing' as const)
  const serviceKey = both ? 'full-content' : wantsPhotography ? 'photography' : 'listing'
  const planName = both ? 'Full Content' : wantsPhotography ? 'Photography' : 'Listing'

  return {
    serviceKey,
    planName,
    model: 'content',
    currency: CURRENCY,
    oneTime: productCount * rate,
    monthly: 0,
    salesShare: null,
    overage: null,
    lines: [line(key, productCount, rate, false)],
  }
}
