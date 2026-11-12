// Run: node --test lib/invoice-state.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { invoiceState } from './invoice-state.ts'

const now = new Date('2026-10-20T12:00:00Z')

test('nothing left to pay is paid, whatever the due date', () => {
  assert.equal(invoiceState({ balance: 0, due_date: '2026-01-01' }, now), 'paid')
})
test('past the due date with a balance is overdue', () => {
  assert.equal(invoiceState({ balance: 100, due_date: '2026-10-19' }, now), 'overdue')
})
test('due today or later, or with no date, is simply due', () => {
  assert.equal(invoiceState({ balance: 100, due_date: '2026-10-20' }, now), 'due')
  assert.equal(invoiceState({ balance: 100, due_date: '2026-11-30' }, now), 'due')
  assert.equal(invoiceState({ balance: 100, due_date: null }, now), 'due')
})
