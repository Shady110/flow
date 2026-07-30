/**
 * Tiny assert-based self-check for the bits of pure logic that would break
 * silently. Run: `node --experimental-strip-types scripts/check.ts`
 * (No test framework in this repo on purpose — `npm run lint && npm run build`
 * cover the rest.)
 */
import assert from 'node:assert/strict'
import { pricingTabs, defaultLandingContent } from '../data/landing-content.ts'

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
