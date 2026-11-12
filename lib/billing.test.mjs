// Run: node --test lib/billing.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { currentCycle, cycleLines, addMonths, planAt } from './billing.ts'

const deal = {
  platforms: ['amazon'],
  phases: [{ plan: 'Basic', months: 3, monthly: 2500 }, { plan: 'Premium', months: 3, monthly: 5000 }],
  one_time: 1000,
}
const day = (s) => new Date(`${s}T10:00:00Z`)

test('nothing is billed before the contract starts', () => {
  assert.equal(currentCycle('2026-11-01', deal, day('2026-10-31')), null)
})

test('month 1 is Basic, carries the one-time fee, and is due a week after the cycle starts', () => {
  const c = currentCycle('2026-11-01', deal, day('2026-11-01'))
  assert.deepEqual([c.month, c.of, c.plan, c.monthly, c.oneTime, c.period, c.dueDate], [1, 6, 'Basic', 2500, 1000, '2026-11-01', '2026-11-08'])
})

test('the package switches at the phase boundary and the fee is charged once', () => {
  assert.equal(currentCycle('2026-11-01', deal, day('2027-01-20')).plan, 'Basic') // month 3
  const m4 = currentCycle('2026-11-01', deal, day('2027-02-01'))
  assert.deepEqual([m4.month, m4.plan, m4.monthly, m4.oneTime], [4, 'Premium', 5000, 0])
})

test('the last month bills, the month after does not', () => {
  assert.equal(currentCycle('2026-11-01', deal, day('2027-04-30')).month, 6)
  assert.equal(currentCycle('2026-11-01', deal, day('2027-05-01')), null)
})

test('a mid-month start bills on its own anniversary, and the same cycle has the same period all month', () => {
  assert.equal(currentCycle('2026-11-15', deal, day('2026-12-14')).month, 1)
  const a = currentCycle('2026-11-15', deal, day('2026-12-15'))
  const b = currentCycle('2026-11-15', deal, day('2027-01-10'))
  assert.equal(a.month, 2)
  assert.equal(b.month, 2)
  assert.equal(a.period, b.period)
})

test('end-of-month starts clamp (Jan 31 -> Feb 28) instead of skipping a month', () => {
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28')
  assert.equal(currentCycle('2026-01-31', deal, day('2026-02-27')).month, 1)
  assert.equal(currentCycle('2026-01-31', deal, day('2026-02-28')).month, 2)
})

test('missed months are not back-filled: only the current cycle is returned', () => {
  assert.equal(currentCycle('2026-01-01', deal, day('2026-04-05')).month, 4)
})

test('invoice lines: the plan for the month, plus the setup fee on month 1 only', () => {
  const m1 = cycleLines(currentCycle('2026-11-01', deal, day('2026-11-01')))
  assert.deepEqual(m1.map((l) => l.unit_price), [2500, 1000])
  assert.match(m1[0].description, /Basic plan: month 1 of 6/)
  assert.equal(cycleLines(currentCycle('2026-11-01', deal, day('2026-12-01'))).length, 1)
  assert.equal(planAt(deal, 7), null)
})
