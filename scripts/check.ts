/**
 * Tiny assert-based self-check for the bits of pure logic that would break
 * silently. Run: `node --experimental-strip-types scripts/check.ts`
 * (No test framework in this repo on purpose — `npm run lint && npm run build`
 * cover the rest.)
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { pricingTabs, defaultLandingContent } from '../data/landing-content.ts'
import { SERVICE_OPTIONS, SERVICE_VALUES } from '../lib/service-options.ts'
import {
  ACCOUNT_PLANS,
  CONTENT_RATES,
  GROWTH_TIERS,
  quote,
  growthTierFor,
} from '../lib/pricing/quote.ts'

// The shipped content is tabbed, and the tab we push people to must exist.
for (const locale of ['en', 'ar'] as const) {
  const pricing = defaultLandingContent[locale].pricing
  const tabs = pricingTabs(pricing)
  assert.equal(tabs.length, 3, `${locale}: expected 3 pricing tabs`)
  assert.ok(
    tabs.some((t) => t.id === pricing.defaultTab),
    `${locale}: defaultTab "${pricing.defaultTab}" matches no tab id`,
  )
  for (const tab of tabs) {
    assert.ok(tab.plans.length > 0, `${locale}/${tab.id}: no plans`)
    // Exactly one featured card per tab, or the highlight loses its meaning.
    assert.equal(
      tab.plans.filter((p) => p.featured).length,
      1,
      `${locale}/${tab.id}: expected exactly one featured plan`,
    )
    // A CTA that preselects a service the form doesn't offer would silently
    // send a lead with an unusable plan_interest.
    for (const plan of tab.plans) {
      assert.ok(
        plan.serviceKey && SERVICE_VALUES.includes(plan.serviceKey),
        `${locale}/${tab.id}/${plan.name}: serviceKey ${plan.serviceKey ?? '(missing)'} is not a contact-form option`,
      )
    }
  }
}

// The two catalogs must carry exactly the same keys — a key present in one and
// missing in the other throws at render time for that locale only, which is the
// kind of bug nobody sees until an Arabic-speaking user hits the page.
{
  const load = (f: string) =>
    JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'))
  const flatten = (obj: Record<string, unknown>, prefix = ''): string[] =>
    Object.entries(obj).flatMap(([k, v]) =>
      v && typeof v === 'object'
        ? flatten(v as Record<string, unknown>, `${prefix}${k}.`)
        : [`${prefix}${k}`],
    )
  const en = new Set(flatten(load('messages/en.json')))
  const ar = new Set(flatten(load('messages/ar.json')))
  const enOnly = [...en].filter((k) => !ar.has(k))
  const arOnly = [...ar].filter((k) => !en.has(k))
  assert.deepEqual(enOnly, [], `keys missing from ar.json: ${enOnly.join(', ')}`)
  assert.deepEqual(arOnly, [], `keys missing from en.json: ${arOnly.join(', ')}`)
}

// Every service option needs its label in BOTH catalogs, or the form throws on
// a missing next-intl key.
for (const file of ['messages/en.json', 'messages/ar.json']) {
  const opts = JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'))
    .marketing.contactForm.serviceOptions
  for (const { key } of SERVICE_OPTIONS) {
    assert.ok(opts[key], `${file}: missing serviceOptions.${key}`)
  }
}

// A landing_content row still saved in the old flat shape must not blank the
// section — it degrades to a single unnamed tab.
{
  const legacy = { plans: [{ name: 'Old', features: [], unit: '', kicker: '', cta: '' }] }
  const tabs = pricingTabs(legacy as never)
  assert.equal(tabs.length, 1)
  assert.equal(tabs[0].plans[0].name, 'Old')
  assert.deepEqual(pricingTabs({} as never), [])
}

// ── The rate card must agree with the prices we actually advertise ──────────
// lib/pricing/rate-card.ts drives the quote calculator; the landing blob drives
// what visitors read. If they drift, the chatbot quotes one number and the page
// shows another — the single most damaging bug this feature can ship.
{
  const tabs = pricingTabs(defaultLandingContent.en.pricing)
  const plan = (serviceKey: string) => {
    const found = tabs.flatMap((t) => t.plans).find((p) => p.serviceKey === serviceKey)
    assert.ok(found, `rate card references serviceKey "${serviceKey}" with no matching plan`)
    return found
  }

  const contentKeys = { listing: 'listing', photography: 'photography', full: 'full-content' } as const
  for (const [rateKey, serviceKey] of Object.entries(contentKeys)) {
    assert.equal(
      plan(serviceKey).priceValue,
      CONTENT_RATES[rateKey as keyof typeof CONTENT_RATES],
      `CONTENT_RATES.${rateKey} disagrees with the "${serviceKey}" pricing card`,
    )
  }

  for (const p of ACCOUNT_PLANS) {
    assert.equal(plan(p.serviceKey).priceValue, p.monthly, `${p.serviceKey}: monthly fee drift`)
  }

  for (const tier of GROWTH_TIERS) {
    const card = plan(tier.serviceKey)
    assert.equal(card.priceValue, tier.monthly, `${tier.serviceKey}: monthly fee drift`)
    // Product cap and extra-item rate live in the card's spec table as prose,
    // so assert the numbers appear rather than trying to parse the sentence.
    const spec = (card.bulk?.rows ?? []).map((r) => `${r.label}: ${r.value}`).join(' | ')
    assert.match(
      spec,
      new RegExp(`Products:[^|]*${tier.productCap}`),
      `${tier.serviceKey}: productCap ${tier.productCap} missing from the card spec (${spec})`,
    )
    assert.match(
      spec,
      new RegExp(`Extra items:[^|]*${tier.extraItemRate}`),
      `${tier.serviceKey}: extraItemRate ${tier.extraItemRate} missing from the card spec (${spec})`,
    )
  }

  // Growth tiers must be ordered by ascending cap — growthTierFor() takes the
  // first tier that fits and would otherwise pick a plan that is too small.
  for (let i = 1; i < GROWTH_TIERS.length; i++) {
    assert.ok(
      GROWTH_TIERS[i].productCap > GROWTH_TIERS[i - 1].productCap,
      'GROWTH_TIERS must be ordered by ascending productCap',
    )
  }
}

// ── Prices restated in the JSON-LD are what Google indexes ──────────────────
// app/structured-data.tsx spells the rate card out in prose for search engines
// and AI crawlers. It is the same trap the FAQ fell into — a price changes and
// this copy silently keeps advertising the old one, in the one place we cannot
// see it. Assert every headline figure still appears verbatim.
{
  const seo = readFileSync(new URL('../app/structured-data.tsx', import.meta.url), 'utf8')
  const fmt = (n: number) => n.toLocaleString('en-US')
  const required = [
    ...Object.values(CONTENT_RATES).map((r) => `${r} EGP`),
    ...ACCOUNT_PLANS.map((p) => `${fmt(p.monthly)} EGP`),
    ...GROWTH_TIERS.map((t) => `${fmt(t.monthly)} EGP`),
    ...GROWTH_TIERS.map((t) => `${t.productCap}`),
  ]
  for (const needle of required) {
    assert.ok(
      seo.includes(needle),
      `app/structured-data.tsx no longer mentions "${needle}" — the JSON-LD is advertising a stale price to search engines`,
    )
  }
}

// ── quote(): the numbers the chatbot and the package builder both hand out ──
{
  const c = (q: ReturnType<typeof quote>) => ({
    key: q.serviceKey,
    oneTime: q.oneTime,
    monthly: q.monthly,
  })

  // Content only — one-time, per item, no recurring fee.
  assert.deepEqual(c(quote({ productCount: 50, needs: ['listing'] })), {
    key: 'listing',
    oneTime: 500,
    monthly: 0,
  })
  assert.deepEqual(c(quote({ productCount: 50, needs: ['photography'] })), {
    key: 'photography',
    oneTime: 1500,
    monthly: 0,
  })
  // Both together must beat buying them separately (35 < 10 + 30).
  const bundled = quote({ productCount: 50, needs: ['photography', 'listing'] })
  assert.deepEqual(c(bundled), { key: 'full-content', oneTime: 1750, monthly: 0 })
  assert.ok(bundled.oneTime < 500 + 1500, 'the combined content package must be a discount')

  // Account management alone — monthly + a fixed share, no one-time cost.
  assert.deepEqual(c(quote({ productCount: 20, needs: ['accountManagement'] })), {
    key: 'account-basic',
    oneTime: 0,
    monthly: 2500,
  })
  assert.deepEqual(c(quote({ productCount: 300, needs: ['accountManagement'] })), {
    key: 'account-premium',
    oneTime: 0,
    monthly: 5000,
  })

  // Content + management → an all-in growth plan sized to the catalogue.
  assert.equal(quote({ productCount: 40, needs: ['listing', 'accountManagement'] }).serviceKey, 'growth-starter')
  assert.equal(quote({ productCount: 150, needs: ['listing', 'accountManagement'] }).serviceKey, 'growth')
  const scale = quote({ productCount: 200, needs: ['photography', 'listing', 'accountManagement'] })
  assert.equal(scale.serviceKey, 'growth-scale')
  assert.equal(scale.monthly, 16000)
  assert.equal(scale.overage, null, '200 products sits inside the Scale cap — no overage')
  assert.deepEqual(scale.salesShare, { from: 2.5, cap: 5 })

  // Over the biggest cap: stay on Scale, bill the extras at its reduced rate.
  const over = quote({ productCount: 500, needs: ['photography', 'listing', 'accountManagement'] })
  assert.equal(over.serviceKey, 'growth-scale')
  assert.deepEqual(over.overage, { count: 100, rate: 20, total: 2000 })
  assert.equal(over.monthly, 18000)

  // Starter's share is flat; the others escalate but stay capped at 5%.
  assert.deepEqual(growthTierFor(10).salesShareFrom, growthTierFor(10).salesShareCap)
  for (const tier of GROWTH_TIERS) {
    assert.ok(tier.salesShareCap <= 5, `${tier.serviceKey}: sales share cap must not exceed 5%`)
    assert.ok(tier.salesShareFrom <= tier.salesShareCap, `${tier.serviceKey}: share starts above its cap`)
  }

  // Garbage in must not produce a bill.
  assert.equal(quote({ productCount: 10, needs: [] }).model, 'none')
  assert.equal(quote({ productCount: -5, needs: ['listing'] }).oneTime, 0)
  assert.equal(quote({ productCount: 2.7, needs: ['listing'] }).oneTime, 20)

  // Every serviceKey the calculator can emit must be a real contact-form option,
  // or the CTA it produces sends a lead with an unusable plan_interest.
  const emitted = [
    ...['listing', 'photography', 'full-content'],
    ...ACCOUNT_PLANS.map((p) => p.serviceKey),
    ...GROWTH_TIERS.map((t) => t.serviceKey),
    'not-sure',
  ]
  for (const key of emitted) {
    assert.ok(SERVICE_VALUES.includes(key), `quote() can emit "${key}", which is not a service option`)
  }
}

console.log('check.ts: ok')
