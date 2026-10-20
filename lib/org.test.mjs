// Run: node --test lib/org.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { visibleTeam, levelRank } from './org.ts'

const team = [
  { id: 'ceo', department_key: 'management', level: 'head' },
  { id: 's1', department_key: 'sales', level: 'head' },
  { id: 's2', department_key: 'sales', level: 'member' },
  { id: 'c1', department_key: 'content', level: 'lead' },
  { id: 'x', department_key: null, level: null },
]
const ids = (l) => l.map((p) => p.id)

test('the CEO view sees everyone', () => {
  assert.deepEqual(ids(visibleTeam({ ...team[0], seesAll: true }, team)), ['ceo', 's1', 's2', 'c1', 'x'])
})
test('a head or lead sees their department', () => {
  assert.deepEqual(ids(visibleTeam({ ...team[1], seesAll: false }, team)), ['s1', 's2'])
  assert.deepEqual(ids(visibleTeam({ ...team[3], seesAll: false }, team)), ['c1'])
})
test('a member sees only themselves', () => {
  assert.deepEqual(ids(visibleTeam({ ...team[2], seesAll: false }, team)), ['s2'])
})
test('someone with no department sees only themselves', () => {
  assert.deepEqual(ids(visibleTeam({ ...team[4], seesAll: false }, team)), ['x'])
})
test('heads rank first', () => assert.ok(levelRank('head') < levelRank('lead') && levelRank('lead') < levelRank('member') && levelRank('member') < levelRank(null)))
