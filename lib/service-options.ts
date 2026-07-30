/**
 * The contact form's "service" choices. Single source of truth so a pricing
 * plan's `serviceKey` can't drift from the options the form actually offers —
 * scripts/check.ts asserts every plan points at one of these.
 *
 * `value` is what gets stored on the lead (`leads.plan_interest`); `key` is the
 * next-intl key under `marketing.contactForm.serviceOptions`.
 */
export const SERVICE_OPTIONS = [
  { value: 'growth', key: 'growth' },
  { value: 'growth-starter', key: 'growthStarter' },
  { value: 'growth-scale', key: 'growthScale' },
  { value: 'account-basic', key: 'accountBasic' },
  { value: 'account-premium', key: 'accountPremium' },
  { value: 'full-content', key: 'fullContent' },
  { value: 'photography', key: 'photography' },
  { value: 'listing', key: 'listing' },
  { value: 'not-sure', key: 'notSure' },
] as const

export const SERVICE_VALUES: readonly string[] = SERVICE_OPTIONS.map((o) => o.value)
