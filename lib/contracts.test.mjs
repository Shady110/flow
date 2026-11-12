// Self-check for contract rendering and deal maths. Run: node --test lib/contracts.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderContract, phasesTable, leftoverPlaceholders } from './contracts.ts'
import { dealTotal, dealMonths, monthlyAt, parseDeal } from './deals.ts'

const deal = {
  platforms: ['amazon', 'noon'],
  phases: [
    { plan: 'Basic', months: 3, monthly: 2500 },
    { plan: 'Premium', months: 3, monthly: 5000 },
  ],
  one_time: 1000,
}
const vars = {
  locale: 'en',
  client_name: 'Acme',
  company: 'Acme Trading LLC',
  contact_name: 'Sara',
  platforms: ['Amazon', 'Noon'],
  start_date: '2026-11-01',
  today: '2026-10-19',
  deal,
}

test('a 3 + 3 month deal totals both phases plus the one-time fee', () => {
  assert.equal(dealMonths(deal), 6)
  assert.equal(dealTotal(deal), 3 * 2500 + 3 * 5000 + 1000)
})

test('monthlyAt switches package at the phase boundary and ends with the contract', () => {
  assert.equal(monthlyAt(deal, 3), 2500)
  assert.equal(monthlyAt(deal, 4), 5000)
  assert.equal(monthlyAt(deal, 6), 5000)
  assert.equal(monthlyAt(deal, 7), null)
})

test('phases table numbers the months across phases', () => {
  const lines = phasesTable(deal, 'en').split('\n')
  assert.equal(lines[0], 'Months 1–3: Basic — 2,500 EGP per month (7,500 EGP)')
  assert.equal(lines[1], 'Months 4–6: Premium — 5,000 EGP per month (15,000 EGP)')
  assert.equal(lines[2], 'One-time fee: 1,000 EGP')
})

test('placeholders are filled, with or without inner spaces', () => {
  const { text, unresolved } = renderContract('For {{client_name}} ({{ company }}), {{months}} months, {{total}}.', vars)
  assert.equal(text, 'For Acme (Acme Trading LLC), 6 months, 23,500 EGP.')
  assert.deepEqual(unresolved, [])
})

test('unknown or empty placeholders stay visible and are reported', () => {
  const { text, unresolved } = renderContract('{{client_name}} {{nonsense}} {{start_date}}', { ...vars, start_date: '' })
  assert.equal(text, 'Acme {{nonsense}} {{start_date}}')
  assert.deepEqual(unresolved.sort(), ['nonsense', 'start_date'])
  assert.deepEqual(leftoverPlaceholders(text).sort(), ['nonsense', 'start_date'])
})

test('Arabic output uses Arabic phrasing and currency', () => {
  assert.match(phasesTable(deal, 'ar'), /^الأشهر 1–3: باقة Basic — 2,500 ج\.م شهريًا/)
})

test('parseDeal rejects unusable shapes', () => {
  assert.equal(parseDeal(null), null)
  assert.equal(parseDeal({ phases: [] }), null)
  assert.equal(parseDeal({ phases: [{ plan: 'x', months: 0, monthly: 10 }] }), null)
  assert.equal(parseDeal({ phases: [{ plan: 'x', months: 2, monthly: 10 }] })?.phases[0].months, 2)
})
