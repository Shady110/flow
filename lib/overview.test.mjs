// Self-check for the CEO-home aggregation. Run: node --test lib/overview.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pipelineCounts, needsAttention, workloadByPerson, budgetVsCost, relativeTime } from './overview.ts'

const now = new Date('2026-10-20T12:00:00Z')
const daysAgo = (n) => new Date(now.getTime() - n * 86_400_000).toISOString()

test('pipeline: open leads, onboarding clients, and platform accounts of onboarded clients', () => {
  const c = pipelineCounts({
    leads: [{ status: 'new' }, { status: 'proposal' }, { status: 'won' }, { status: 'lost' }],
    clients: [
      { id: 'a', stage: 'group_created' },
      { id: 'b', stage: 'paperwork' },
      { id: 'c', stage: 'onboarded' },
    ],
    platforms: [
      { client_id: 'a', stage: 'platform_creation' }, // client not onboarded yet → not its own card
      { client_id: 'c', stage: 'listing' },
      { client_id: 'c', stage: 'managing' },
    ],
  })
  assert.equal(c.lead, 2)
  assert.equal(c.group_created, 1)
  assert.equal(c.paperwork, 1)
  assert.equal(c.platform_creation, 0)
  assert.equal(c.listing, 1)
  assert.equal(c.managing, 1)
})

const empty = { contractsSent: [], documentsSubmitted: [], listing: [], tickets: [], invoices: [], tasks: [] }

test('attention: severity first, then oldest; capped at the limit', () => {
  const items = needsAttention(
    {
      ...empty,
      contractsSent: [{ client_id: 'a', sent_at: daysAgo(3) }],
      tickets: [{ id: 't1', number: 'TCK-1', client_id: 'a', priority: 'urgent', assignee_id: 'p', created_at: daysAgo(1) }],
      invoices: [{ id: 'i1', number: 'FLOW-1', client_id: 'b', due_date: '2026-09-01', balance: 500 }],
    },
    now,
  )
  assert.deepEqual(items.map((i) => i.kind), ['invoice_overdue', 'ticket_urgent', 'contract_unsigned'])
  assert.equal(needsAttention({ ...empty, tasks: Array.from({ length: 20 }, (_, n) => ({ id: `${n}`, title: 'x', client_id: 'a', due_date: '2026-01-01' })) }, now, 5).length, 5)
})

test('attention: listing only counts when deliverables are missing AND it has sat for days', () => {
  const l = (missing, age) => ({ client_id: 'a', id: 'p', updated_at: daysAgo(age), missing })
  assert.equal(needsAttention({ ...empty, listing: [l(0, 30)] }, now).length, 0)
  assert.equal(needsAttention({ ...empty, listing: [l(2, 1)] }, now).length, 0)
  const [stuck] = needsAttention({ ...empty, listing: [l(2, 20)] }, now)
  assert.equal(stuck.kind, 'listing_stuck')
  assert.equal(stuck.severity, 'high')
})

test('attention: paid or not-yet-due invoices and low-priority assigned tickets are ignored; unassigned ones are flagged', () => {
  const items = needsAttention(
    {
      ...empty,
      invoices: [
        { id: 'i1', number: 'A', client_id: 'a', due_date: '2026-09-01', balance: 0 },
        { id: 'i2', number: 'B', client_id: 'a', due_date: '2026-12-01', balance: 10 },
      ],
      tickets: [
        { id: 't1', number: 'T1', client_id: 'a', priority: 'normal', assignee_id: 'p', created_at: daysAgo(1) },
        { id: 't2', number: 'T2', client_id: 'a', priority: 'normal', assignee_id: null, created_at: daysAgo(1) },
      ],
    },
    now,
  )
  assert.deepEqual(items.map((i) => i.kind), ['ticket_unassigned'])
})

test('workload counts each person\'s open leads, accounts, tickets and tasks; the content queue goes to the content director', () => {
  const rows = workloadByPerson({
    team: [
      { id: 'ceo', name: 'Shady', role: 'co-founder' },
      { id: 'k', name: 'Kareem', role: 'content-director' },
    ],
    leads: [{ owner_id: 'ceo', status: 'new' }, { owner_id: 'ceo', status: 'won' }],
    platforms: [
      { stage: 'managing', account_manager_id: 'k' },
      { stage: 'listing', account_manager_id: 'k' }, // not an account to manage yet
    ],
    tickets: [{ assignee_id: 'k' }, { assignee_id: 'k' }],
    tasks: [{ assignee_ids: ['ceo', 'k'] }],
    listingCount: 4,
  })
  const k = rows.find((r) => r.id === 'k')
  assert.deepEqual([k.leads, k.contentQueue, k.accounts, k.tickets, k.tasks, k.total], [0, 4, 1, 2, 1, 8])
  assert.equal(rows[0].id, 'k') // busiest first
  assert.equal(rows.find((r) => r.id === 'ceo').total, 2)
})

test('budget vs cost skips churned clients and tolerates blanks', () => {
  const r = budgetVsCost([
    { status: 'active', budget: 10000, estimated_cost: 6000 },
    { status: 'active', budget: null, estimated_cost: 1000 },
    { status: 'churned', budget: 99999, estimated_cost: 1 },
  ])
  assert.deepEqual(r, { budget: 10000, cost: 7000, margin: 3000, marginPct: 30 })
  assert.equal(budgetVsCost([]).marginPct, null)
})

test('relative time picks the largest sensible unit', () => {
  const at = (ms) => new Date(now.getTime() - ms).toISOString()
  assert.equal(relativeTime(at(2 * 3_600_000), 'en', now), '2 hours ago')
  assert.equal(relativeTime(at(86_400_000), 'en', now), 'yesterday')
  assert.equal(relativeTime(at(5 * 60_000), 'en', now), '5 minutes ago')
})
