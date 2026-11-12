// Run: node --test lib/tenant.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolvePortal, portalOrigin, getSubdomain } from './tenant.ts'

const root = 'flow.com'
test('apex and www are marketing', () => {
  assert.deepEqual(resolvePortal('flow.com', root), { portal: 'marketing', legacyClient: false })
  assert.deepEqual(resolvePortal('www.flow.com', root), { portal: 'marketing', legacyClient: false })
})
test('app is internal and portal is the one client address', () => {
  assert.equal(resolvePortal('app.flow.com', root).portal, 'internal')
  assert.deepEqual(resolvePortal('portal.flow.com', root, 'portal'), { portal: 'client', legacyClient: false })
  assert.equal(resolvePortal('plus.flow.com', root, 'plus').portal, 'client')
})
test('an old client subdomain is flagged for redirect', () => {
  assert.deepEqual(resolvePortal('acme.flow.com', root, 'portal'), { portal: 'client', legacyClient: true })
})
test('other reserved labels stay marketing', () => {
  assert.equal(resolvePortal('api.flow.com', root, 'portal').portal, 'marketing')
})
test('dev hosts with a port', () => {
  assert.equal(getSubdomain('portal.localhost:3000', 'localhost:3000'), 'portal')
  assert.equal(resolvePortal('app.localhost:3000', 'localhost:3000').portal, 'internal')
})
test('origins', () => {
  assert.equal(portalOrigin('internal', 'flow.com'), 'https://app.flow.com')
  assert.equal(portalOrigin('client', 'localhost:3000', 'portal'), 'http://portal.localhost:3000')
})
