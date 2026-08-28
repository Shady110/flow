/**
 * The rate card and the custom-package calculator. One pure function, two front
 * doors: the /pricing package builder calls it in the browser, and the website
 * chatbot calls it server-side as a Gemini tool.
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

// ── Feature-level account management ────────────────────────────────────────
// Buying one capability ("we only want you creating PO's") instead of a whole
// tier. Derived from the tiers themselves: Premium - Basic = 2,500/mo for four
// features, so ~625/mo each is the anchor, adjusted for how much ongoing labour
// each one actually is.

/**
 * Charged whenever ANY account module is selected. It carries the fixed cost of
 * holding account access, a named contact, monthly reporting and account setup
 * — the work that exists no matter how little else is bought. Setup used to be
 * a 1,500 one-time module; it is folded in here so a custom plan is a single
 * monthly figure with nothing billed separately.
 *
 * Without it a single cheap module prices below the cost of servicing the
 * client at all, and cherry-picking undercuts the packaged tiers. Every
 * a-la-carte total must stay ABOVE the bundle it mirrors; scripts/check.ts
 * asserts exactly that.
 */
export const ACCOUNT_BASE = { monthly: 1000 } as const

export interface AccountModule {
  key: ModuleKey
  monthly: number
  /** Charged once at the start, on top of `monthly`. */
  oneTime: number
  /**
   * Whether this module directly drives the seller's revenue. Selecting one
   * lifts the sales share from 1% to 2%, mirroring Basic vs Premium.
   */
  revenueDriving: boolean
}

export const MODULE_KEYS = [
  'uploading',
  'returns',
  'fba',
  'purchase-orders',
  'brand-registry',
  'price-analysis',
] as const
export type ModuleKey = (typeof MODULE_KEYS)[number]

export const ACCOUNT_MODULES: readonly AccountModule[] = [
  { key: 'uploading', monthly: 900, oneTime: 0, revenueDriving: false },
  { key: 'returns', monthly: 700, oneTime: 0, revenueDriving: false },
  { key: 'fba', monthly: 1100, oneTime: 0, revenueDriving: true },
  { key: 'purchase-orders', monthly: 700, oneTime: 0, revenueDriving: false },
  // Enrolment used to carry an 800 one-off; it is inside this monthly now.
  { key: 'brand-registry', monthly: 500, oneTime: 0, revenueDriving: false },
  { key: 'price-analysis', monthly: 800, oneTime: 0, revenueDriving: true },
]

/** Which modules each packaged account tier already covers. */
const BASIC_COVERS: readonly ModuleKey[] = ['uploading', 'returns']
const PREMIUM_COVERS: readonly ModuleKey[] = [
  ...BASIC_COVERS,
  'fba',
  'purchase-orders',
  'brand-registry',
  'price-analysis',
]

export const NEEDS = ['photography', 'listing'] as const
export type Need = (typeof NEEDS)[number]

export interface QuoteInput {
  /** How many products the seller wants covered. */
  productCount: number
  /** Which content work they want. */
  content?: Need[]
  /**
   * Whether content is a one-off batch or an ongoing monthly volume.
   *
   * The Content tab sells one-time work per product; a custom plan sells "up to
   * N products per month", exactly as the growth tiers do. Defaults to monthly
   * whenever account modules are selected, because a plan with account
   * management is a subscription by definition.
   */
  contentBilling?: 'one-time' | 'monthly'
  /** Monthly account-management modules. */
  modules?: ModuleKey[]
  /** Marketplaces the seller is on. Informational — it does not move the price. */
  platforms?: string[]
}

export type LineKey =
  | 'content-listing'
  | 'content-photography'
  | 'content-full'
  | 'account-base'
  | `module-${ModuleKey}`

export interface QuoteLine {
  /** Stable identifier; each consumer supplies its own localized label. */
  key: LineKey
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
  /** Which pricing model was selected. */
  model: 'content' | 'custom' | 'none'
  currency: typeof CURRENCY
  /** Total billed once, up front. */
  oneTime: number
  /** Total billed every month. */
  monthly: number
  /** Share of managed sales, in percent, on top of `monthly`. */
  salesShare: number | null
  lines: QuoteLine[]
  /**
   * A packaged tier that covers everything selected for less money. Only
   * account bundles are compared, and only on the recurring fee — that is the
   * one apples-to-apples comparison available.
   *
   * Growth tiers are deliberately NOT compared: they bundle *ongoing* content
   * for the whole catalogue, while a custom build prices content as a one-time
   * batch. Putting the two totals side by side would tell most sellers custom
   * is cheaper, which is both misleading and the opposite of protecting the
   * packages.
   */
  betterBundle: { serviceKey: string; name: string; monthly: number; saving: number } | null
}

/** Products beyond this are a bespoke conversation, not a calculator result. */
const MAX_PRODUCTS = 100_000

const line = (key: LineKey, qty: number, rate: number, recurring: boolean): QuoteLine => ({
  key,
  qty,
  rate,
  total: qty * rate,
  recurring,
})

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

/** The packaged tier that covers `modules` for less than `monthly`, if any. */
function cheaperBundle(modules: ModuleKey[], monthly: number): Quote['betterBundle'] {
  const within = (covers: readonly ModuleKey[]) => modules.every((m) => covers.includes(m))
  const candidates = [
    within(BASIC_COVERS) ? ACCOUNT_PLANS[0] : null,
    within(PREMIUM_COVERS) ? ACCOUNT_PLANS[1] : null,
  ].filter((p): p is (typeof ACCOUNT_PLANS)[number] => p !== null && p.monthly < monthly)

  // Cheapest qualifying tier wins.
  const best = candidates.sort((a, b) => a.monthly - b.monthly)[0]
  return best
    ? {
        serviceKey: best.serviceKey,
        name: best.name,
        monthly: best.monthly,
        saving: monthly - best.monthly,
      }
    : null
}

export function quote(input: QuoteInput): Quote {
  const productCount = Math.min(
    MAX_PRODUCTS,
    Math.max(0, Math.floor(input.productCount) || 0),
  )
  const content = new Set((input.content ?? []).filter((c) => NEEDS.includes(c)))
  // Preserve ACCOUNT_MODULES order so the quote reads the same way every time,
  // whatever order the caller ticked the boxes in.
  const modules = ACCOUNT_MODULES.filter((m) => (input.modules ?? []).includes(m.key)).map(
    (m) => m.key,
  )

  const wantsPhotography = content.has('photography')
  const wantsListing = content.has('listing')
  const wantsContent = wantsPhotography || wantsListing
  const wantsAccount = modules.length > 0

  if (!wantsContent && !wantsAccount) {
    return {
      serviceKey: 'not-sure',
      model: 'none',
      currency: CURRENCY,
      oneTime: 0,
      monthly: 0,
      salesShare: null,
      lines: [],
      betterBundle: null,
    }
  }

  const lines: QuoteLine[] = []
  let oneTime = 0
  let monthly = 0

  // ── Content: per product, billed once or every month ─────────────────────
  const contentRecurs = (input.contentBilling ?? (wantsAccount ? 'monthly' : 'one-time')) === 'monthly'
  if (wantsContent) {
    const both = wantsPhotography && wantsListing
    const rate = both
      ? CONTENT_RATES.full
      : wantsPhotography
        ? CONTENT_RATES.photography
        : CONTENT_RATES.listing
    const key: LineKey = both
      ? 'content-full'
      : wantsPhotography
        ? 'content-photography'
        : 'content-listing'
    lines.push(line(key, productCount, rate, contentRecurs))
    if (contentRecurs) monthly += productCount * rate
    else oneTime += productCount * rate
  }

  // ── Account management: base fee plus the chosen modules ─────────────────
  let salesShare: number | null = null
  if (wantsAccount) {
    lines.push(line('account-base', 1, ACCOUNT_BASE.monthly, true))
    monthly += ACCOUNT_BASE.monthly

    let revenueDriving = false
    for (const key of modules) {
      const m = ACCOUNT_MODULES.find((x) => x.key === key)!
      if (m.monthly) {
        lines.push(line(`module-${m.key}`, 1, m.monthly, true))
        monthly += m.monthly
      }
      if (m.oneTime) {
        lines.push(line(`module-${m.key}`, 1, m.oneTime, false))
        oneTime += m.oneTime
      }
      revenueDriving ||= m.revenueDriving
    }
    // Mirrors the packaged tiers: Basic is 1%, Premium 2%. A custom build can
    // never carry less share than the tier that covers the same capability.
    salesShare = revenueDriving ? 2 : 1
  }

  // Content-only selections keep their existing plan identity so the contact
  // form still preselects the right option.
  const contentOnlyKey = wantsPhotography && wantsListing
    ? 'full-content'
    : wantsPhotography
      ? 'photography'
      : 'listing'

  const isPlan = wantsAccount || contentRecurs
  return {
    serviceKey: isPlan ? 'custom' : contentOnlyKey,
    model: isPlan ? 'custom' : 'content',
    currency: CURRENCY,
    oneTime,
    monthly,
    salesShare,
    lines,
    betterBundle: wantsAccount && !wantsContent ? cheaperBundle(modules, monthly) : null,
  }
}
