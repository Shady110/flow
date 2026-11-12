// Run: node --test lib/auth/password-policy.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkPassword } from './password-policy.ts'

test('accepts a decent password', () => assert.equal(checkPassword('blue-door-42-lamp', 'sara@shop.com').ok, true))
test('too short', () => assert.equal(checkPassword('abc123', '').longEnough, false))
test('needs letters and numbers', () => {
  assert.equal(checkPassword('onlylettershere', '').lettersAndNumbers, false)
  assert.equal(checkPassword('1234509876', '').lettersAndNumbers, false)
  assert.equal(checkPassword('كلمة-سر-قوية-77', '').lettersAndNumbers, true)
})
test('not the email or its name part', () => {
  assert.equal(checkPassword('sara@shop.com', 'sara@shop.com').notEmail, false)
  assert.equal(checkPassword('sara-2026-shop', 'sara@shop.com').notEmail, false)
})
test('not a common password', () => assert.equal(checkPassword('Password12345', '').notCommon, false))
