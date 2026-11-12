import test from 'node:test'
import assert from 'node:assert/strict'
import { clientRows, leadSources, monthlyCounts, changeVsLast, leadFunnel, agingBuckets, ticketsByPriority, stageDwell } from './overview-trends.ts'

const now = new Date('2026-02-10T12:00:00Z')
const dAgo = (n) => new Date(now.getTime() - n * 86_400_000).toISOString()

test('monthly counts cross a year boundary, oldest first', () => {
  const s = monthlyCounts([{ created_at: '2025-12-20T00:00:00Z' }, { created_at: '2026-02-01T00:00:00Z' }, { created_at: '2026-02-02T00:00:00Z' }, { created_at: '2024-01-01T00:00:00Z' }], now, 'en', 3)
  assert.deepEqual(s.map((x) => x.count), [1, 0, 2])
  assert.equal(s[0].name, 'Dec')
})

test('change vs last month: zero baseline gives no percentage', () => {
  assert.deepEqual(changeVsLast([0, 4]), { delta: 4, pct: null })
  assert.deepEqual(changeVsLast([4, 6]), { delta: 2, pct: 50 })
  assert.deepEqual(changeVsLast([]), { delta: 0, pct: null })
})

test('lead funnel: reached-at-least counts and win rate; zero leads is safe', () => {
  const f = leadFunnel([{ status: 'new' }, { status: 'lost' }, { status: 'qualified' }, { status: 'won' }])
  assert.deepEqual(f.steps.map((s) => s.count), [4, 2, 2, 1, 1])
  assert.equal(f.winRate, 25)
  assert.equal(leadFunnel([]).winRate, null)
})

test('aging edges: 7 days is 1-7, 8 and 14 are 8-14, 15 is 15+, not due is current', () => {
  const inv = (late, balance = 10, status = 'sent') => ({ status, balance, due_date: dAgo(late) })
  const a = agingBuckets([inv(-3), inv(7), inv(8), inv(14), inv(15), inv(30, 5, 'paid'), inv(20, 0)], now)
  assert.deepEqual(a, { current: 10, late1to7: 10, late8to14: 20, late15plus: 10 })
})

test('tickets by priority keeps a fixed order including empty ones', () => {
  assert.deepEqual(ticketsByPriority([{ priority: 'high' }, { priority: 'high' }]).map((t) => t.count), [0, 2, 0, 0])
})

test('stage dwell: closed stages use the next event, the open one runs to now', () => {
  const d = stageDwell(
    [
      { platform_id: 'p', to_stage: 'listing', created_at: dAgo(10) },
      { platform_id: 'p', to_stage: 'pushing', created_at: dAgo(4) },
    ],
    [{ id: 'p', stage: 'pushing' }],
    now,
  )
  assert.equal(d.listing, 6)
  assert.equal(d.pushing, 4)
})

test('lead sources: grouped case-insensitively, biggest first, missing is unknown, won counted', () => {
  const r = leadSources([
    { source: 'Website', status: 'won' }, { source: 'website', status: 'new' }, { source: 'referral', status: 'new' }, { source: null, status: 'lost' }, { source: '  ', status: 'new' },
  ])
  assert.deepEqual(r, [{ key: 'unknown', count: 2, won: 0 }, { key: 'website', count: 2, won: 1 }, { key: 'referral', count: 1, won: 0 }])
})

test('client rows: stage, owed and the reason to look, worst first; churned clients are left out', () => {
  const rows = clientRows(
    {
      clients: [
        { id: 'a', name: 'Alpha', status: 'active', stage: 'onboarded' },
        { id: 'b', name: 'Beta', status: 'active', stage: 'paperwork' },
        { id: 'c', name: 'Gamma', status: 'active', stage: 'onboarded' },
        { id: 'd', name: 'Gone', status: 'churned', stage: 'onboarded' },
        { id: 'e', name: 'Eps', status: 'active', stage: 'onboarded' },
      ],
      platforms: [
        { client_id: 'a', stage: 'listing', account_status: 'active' },
        { client_id: 'a', stage: 'pushing', account_status: 'active' },
        { client_id: 'c', stage: 'managing', account_status: 'at_risk' },
      ],
      invoices: [{ client_id: 'a', status: 'sent', balance: 100, due_date: dAgo(9) }, { client_id: 'a', status: 'paid', balance: 0, due_date: dAgo(40) }],
      reviewClientIds: ['b'],
    },
    now,
  )
  assert.deepEqual(rows.map((r) => [r.name, r.stage, r.status, r.owed, r.lateDays]), [
    ['Alpha', 'pushing', 'late', 100, 9],
    ['Beta', 'paperwork', 'review', 0, 0],
    ['Gamma', 'managing', 'risk', 0, 0],
    ['Eps', 'platform_creation', 'ok', 0, 0],
  ])
})
