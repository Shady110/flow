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

console.log('check.ts: ok')
