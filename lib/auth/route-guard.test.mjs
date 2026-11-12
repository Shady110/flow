// Run: node --test lib/auth/route-guard.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { guard } from './route-guard.ts'

const g = (o) => guard({ portal: 'internal', signedIn: true, kind: 'staff', path: '/', ...o })

test('signed out: only public pages', () => {
  assert.deepEqual(g({ signedIn: false, kind: undefined, path: '/login' }), { type: 'allow' })
  assert.deepEqual(g({ signedIn: false, kind: undefined, path: '/forgot-password' }), { type: 'allow' })
  assert.deepEqual(g({ signedIn: false, kind: undefined, path: '/clients' }), { type: 'redirect', to: '/login' })
})
test('right kind on right address passes; login bounces home', () => {
  assert.deepEqual(g({ path: '/clients' }), { type: 'allow' })
  assert.deepEqual(g({ path: '/login' }), { type: 'redirect', to: '/' })
})
test('wrong kind never loops: staff on client address and client on team address', () => {
  assert.deepEqual(g({ portal: 'client', kind: 'staff', path: '/' }), { type: 'wrong-address' })
  assert.deepEqual(g({ portal: 'client', kind: 'staff', path: '/login' }), { type: 'wrong-address' })
  assert.deepEqual(g({ portal: 'internal', kind: 'client', path: '/login' }), { type: 'wrong-address' })
})
test('owed password change funnels to /change-password, which stays reachable', () => {
  assert.deepEqual(g({ mustChange: true, path: '/clients' }), { type: 'redirect', to: '/change-password' })
  assert.deepEqual(g({ mustChange: true, path: '/change-password' }), { type: 'allow' })
})
test('legacy token without a kind is allowed (pages verify against the database)', () => {
  assert.deepEqual(g({ kind: undefined, path: '/clients' }), { type: 'allow' })
  assert.deepEqual(g({ kind: undefined, path: '/login' }), { type: 'allow' })
})
