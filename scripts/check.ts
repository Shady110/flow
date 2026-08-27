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
  ACCOUNT_BASE,
  ACCOUNT_MODULES,
  ACCOUNT_PLANS,
  CONTENT_RATES,
  GROWTH_TIERS,
  MODULE_KEYS,
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
  assert.deepEqual(c(quote({ productCount: 50, content: ['listing'] })), {
    key: 'listing',
    oneTime: 500,
    monthly: 0,
  })
  assert.deepEqual(c(quote({ productCount: 50, content: ['photography'] })), {
    key: 'photography',
    oneTime: 1500,
    monthly: 0,
  })
  // Both together must beat buying them separately (35 < 10 + 30).
  const bundled = quote({ productCount: 50, content: ['photography', 'listing'] })
  assert.deepEqual(c(bundled), { key: 'full-content', oneTime: 1750, monthly: 0 })
  assert.ok(bundled.oneTime < 500 + 1500, 'the combined content package must be a discount')

  // Garbage in must not produce a bill.
  assert.equal(quote({ productCount: 10, content: [], modules: [] }).model, 'none')
  assert.equal(quote({ productCount: -5, content: ['listing'] }).oneTime, 0)
  assert.equal(quote({ productCount: 2.7, content: ['listing'] }).oneTime, 20)

  // ── Feature-level account management ──────────────────────────────────────
  // The headline case: buy one capability, not a whole tier.
  const poOnly = quote({ productCount: 0, modules: ['purchase-orders'] })
  assert.equal(poOnly.model, 'custom')
  assert.equal(poOnly.serviceKey, 'custom')
  assert.equal(poOnly.monthly, ACCOUNT_BASE.monthly + 700, 'PO only = base + PO module')
  assert.equal(poOnly.monthly, 1700)
  assert.equal(poOnly.salesShare, 1, 'no revenue-driving module selected -> 1%')
  assert.equal(poOnly.betterBundle, null, 'no tier is cheaper than 1,700')

  // The share mirrors Basic vs Premium: FBA or price analysis lifts it to 2%.
  assert.equal(quote({ productCount: 0, modules: ['returns'] }).salesShare, 1)
  assert.equal(quote({ productCount: 0, modules: ['fba'] }).salesShare, 2)
  assert.equal(quote({ productCount: 0, modules: ['price-analysis'] }).salesShare, 2)
  assert.equal(
    quote({ productCount: 0, modules: ['returns', 'fba'] }).salesShare,
    2,
    'one revenue-driving module is enough to lift the share',
  )
  for (const m of ACCOUNT_MODULES) {
    const q = quote({ productCount: 0, modules: [m.key] })
    assert.ok(q.salesShare !== null && q.salesShare <= 2, `${m.key}: custom share must never exceed Premium's 2%`)
  }

  // One-time fees land in oneTime, never in the recurring total.
  const setup = quote({ productCount: 0, modules: ['setup'] })
  assert.equal(setup.oneTime, 1500)
  assert.equal(setup.monthly, ACCOUNT_BASE.monthly, 'setup is one-time; only the base recurs')
  const registry = quote({ productCount: 0, modules: ['brand-registry'] })
  assert.equal(registry.oneTime, 800, 'Brand Registry enrolment is one-time')
  assert.equal(registry.monthly, ACCOUNT_BASE.monthly + 500)

  // ── The invariant that protects the packaged tiers ────────────────────────
  // Nobody may cherry-pick their way under a bundle. Every a-la-carte mirror of
  // a tier must cost MORE than the tier, and the builder must say so.
  const basicMirror = quote({ productCount: 0, modules: ['setup', 'uploading', 'returns'] })
  assert.ok(
    basicMirror.monthly > ACCOUNT_PLANS[0].monthly,
    `Basic-equivalent (${basicMirror.monthly}) must cost more than the Basic bundle (${ACCOUNT_PLANS[0].monthly})`,
  )
  assert.deepEqual(basicMirror.betterBundle, {
    serviceKey: 'account-basic',
    name: 'Basic',
    monthly: 2500,
    saving: basicMirror.monthly - 2500,
  })

  const premiumMirror = quote({ productCount: 0, modules: [...MODULE_KEYS] })
  assert.ok(
    premiumMirror.monthly > ACCOUNT_PLANS[1].monthly,
    `Premium-equivalent (${premiumMirror.monthly}) must cost more than the Premium bundle (${ACCOUNT_PLANS[1].monthly})`,
  )
  assert.equal(premiumMirror.betterBundle?.serviceKey, 'account-premium')
  assert.equal(premiumMirror.monthly, 5700)

  // A selection Basic cannot cover must never be pointed at Basic.
  const needsPremium = quote({ productCount: 0, modules: ['uploading', 'fba', 'price-analysis', 'returns', 'purchase-orders', 'brand-registry', 'setup'] })
  assert.equal(needsPremium.betterBundle?.serviceKey, 'account-premium')

  // Content + modules is a custom build; content stays one-time, modules recur.
  const mixed = quote({ productCount: 100, content: ['photography', 'listing'], modules: ['uploading'] })
  assert.equal(mixed.model, 'custom')
  assert.equal(mixed.oneTime, 100 * 35)
  assert.equal(mixed.monthly, ACCOUNT_BASE.monthly + 900)
  assert.equal(
    mixed.betterBundle,
    null,
    'a build that includes content is never compared to an account-only tier',
  )

  // Line items must reconcile with the totals, or the breakdown lies.
  for (const q of [poOnly, setup, registry, basicMirror, premiumMirror, mixed]) {
    const rec = q.lines.filter((l) => l.recurring).reduce((s, l) => s + l.total, 0)
    const once = q.lines.filter((l) => !l.recurring).reduce((s, l) => s + l.total, 0)
    assert.equal(rec, q.monthly, `${q.serviceKey}: recurring lines do not sum to monthly`)
    assert.equal(once, q.oneTime, `${q.serviceKey}: one-time lines do not sum to oneTime`)
  }

  // Growth tiers must be ordered by ascending cap — growthTierFor() takes the
  // first tier that fits and would otherwise pick a plan that is too small.
  assert.equal(growthTierFor(40).serviceKey, 'growth-starter')
  assert.equal(growthTierFor(150).serviceKey, 'growth')
  assert.equal(growthTierFor(5000).serviceKey, 'growth-scale')
  assert.deepEqual(growthTierFor(10).salesShareFrom, growthTierFor(10).salesShareCap)
  for (const tier of GROWTH_TIERS) {
    assert.ok(tier.salesShareCap <= 5, `${tier.serviceKey}: sales share cap must not exceed 5%`)
    assert.ok(tier.salesShareFrom <= tier.salesShareCap, `${tier.serviceKey}: share starts above its cap`)
  }

  // Every serviceKey the calculator can emit must be a real contact-form option,
  // or the CTA it produces sends a lead with an unusable plan_interest.
  const emitted = ['listing', 'photography', 'full-content', 'custom', 'not-sure']
  for (const key of emitted) {
    assert.ok(SERVICE_VALUES.includes(key), `quote() can emit "${key}", which is not a service option`)
  }
}

console.log('check.ts: ok')
