// Self-check for the client's next step and journey percent. Run: node --test lib/portal-next-step.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { nextStep, journeyPercent } from './portal-next-step.ts'

const base = { contractWaiting: false, papers: [], invoicesDue: 0, requestsWaiting: 0 }

test('an unsigned contract always comes first', () => {
  const s = nextStep({ ...base, contractWaiting: true, papers: [{ required: true, status: 'rejected' }], invoicesDue: 2 })
  assert.deepEqual(s, { kind: 'sign_contract', href: '/contract', count: 1 })
})

test('rejected papers come before papers that were never sent', () => {
  const s = nextStep({ ...base, papers: [{ required: true, status: 'pending' }, { required: true, status: 'rejected' }, { required: true, status: 'pending' }] })
  assert.equal(s.kind, 'fix_papers')
  assert.equal(s.count, 1)
})

test('only required papers that still need sending count', () => {
  assert.equal(nextStep({ ...base, papers: [{ required: false, status: 'pending' }, { required: true, status: 'submitted' }, { required: true, status: 'approved' }, { required: true, status: 'waived' }] }).kind, 'all_set')
  const s = nextStep({ ...base, papers: [{ required: true, status: 'pending' }, { required: true, status: 'pending' }] })
  assert.deepEqual([s.kind, s.count, s.href], ['upload_papers', 2, '/papers'])
})

test('then payments, then requests waiting on the client, then all set', () => {
  assert.equal(nextStep({ ...base, invoicesDue: 1, requestsWaiting: 3 }).kind, 'pay_invoice')
  assert.equal(nextStep({ ...base, requestsWaiting: 3 }).kind, 'reply_request')
  assert.equal(nextStep(base).kind, 'all_set')
})

test('journey: a new client with one marketplace is at 0%', () => {
  assert.equal(journeyPercent({ clientStage: 'group_created', platforms: [{ stage: 'platform_creation', stages: ['platform_creation', 'listing', 'pushing', 'managing'] }] }), 0)
})

test('journey: marketplaces do not count until the client is onboarded', () => {
  const p = { stage: 'managing', stages: ['platform_creation', 'listing', 'pushing', 'managing'] }
  assert.equal(journeyPercent({ clientStage: 'paperwork', platforms: [p] }), Math.round((1 / 7) * 100))
})

test('journey: onboarded with the account at Listing is 4 of 7, live is 100%', () => {
  const stages = ['platform_creation', 'listing', 'pushing', 'managing']
  assert.equal(journeyPercent({ clientStage: 'onboarded', platforms: [{ stage: 'listing', stages }] }), Math.round((4 / 7) * 100))
  assert.equal(journeyPercent({ clientStage: 'onboarded', platforms: [{ stage: 'managing', stages }] }), 100)
})

test('journey: a customised account (skips creation) is measured on its own steps', () => {
  assert.equal(journeyPercent({ clientStage: 'onboarded', platforms: [{ stage: 'managing', stages: ['pushing', 'managing'] }] }), 100)
  assert.equal(journeyPercent({ clientStage: 'onboarded', platforms: [] }), 100)
})
