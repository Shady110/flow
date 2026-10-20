// Run: node --test lib/payments/kashier-sign.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { orderHash, webhookSigningString, webhookSignature, verifyWebhook } from './kashier-sign.ts'

test("order hash matches the example in Kashier's own docs", () => {
  // developers.kashier.io/docs/direct-api/hashing: mid-0-1, ref 99, 20 EGP, key 11111
  assert.equal(
    orderHash({ mid: 'mid-0-1', reference: '99', amount: 20, currency: 'EGP' }, '11111'),
    '606a8a1307d64caf4e2e9bb724738f115a8972c27eccb2a8acd9194c357e4bec',
  )
})

test('the customer reference is appended to the signed string when given', () => {
  const plain = orderHash({ mid: 'm', reference: 'r', amount: 5, currency: 'EGP' }, 'k')
  const withCustomer = orderHash({ mid: 'm', reference: 'r', amount: 5, currency: 'EGP', customerReference: 'c1' }, 'k')
  assert.notEqual(plain, withCustomer)
})

const data = {
  merchantOrderId: 'INV-1', status: 'SUCCESS', amount: 250, currency: 'EGP', transactionId: 'TX-9',
  extra: 'not signed', signatureKeys: ['transactionId', 'status', 'merchantOrderId', 'currency', 'amount'],
}

test('webhook signing string sorts the named keys and url-encodes the values', () => {
  assert.equal(webhookSigningString(data), 'amount=250&currency=EGP&merchantOrderId=INV-1&status=SUCCESS&transactionId=TX-9')
  assert.equal(webhookSigningString({ a: 'x y&z', signatureKeys: ['a'] }), 'a=x%20y%26z')
})

test('a correctly signed webhook verifies, in any letter case', () => {
  const sig = webhookSignature(data, 'secret')
  assert.equal(verifyWebhook(data, sig, 'secret'), true)
  assert.equal(verifyWebhook(data, sig.toUpperCase(), 'secret'), true)
})

test('tampering with a signed field, the key or the header all fail; unsigned fields do not matter', () => {
  const sig = webhookSignature(data, 'secret')
  assert.equal(verifyWebhook({ ...data, amount: 1 }, sig, 'secret'), false)
  assert.equal(verifyWebhook(data, sig, 'other-key'), false)
  assert.equal(verifyWebhook(data, 'deadbeef', 'secret'), false)
  assert.equal(verifyWebhook({ ...data, extra: 'changed' }, sig, 'secret'), true)
})

test('a webhook with no signatureKeys or no header is never accepted', () => {
  assert.equal(verifyWebhook({ status: 'SUCCESS' }, 'abc', 'secret'), false)
  assert.equal(verifyWebhook(data, null, 'secret'), false)
  assert.equal(verifyWebhook({ ...data, signatureKeys: [] }, 'abc', 'secret'), false)
})
