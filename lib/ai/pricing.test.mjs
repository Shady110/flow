// Self-check for the cost maths. Run: node --test lib/ai/pricing.test.mjs
// Reference figures come from the live API probe: an image call reports
// promptTokenCount 281 and candidatesTokensDetails IMAGE 1290.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { costUsd, TOKENS_PER_IMAGE } from './pricing.ts'

const image = (images, inputTokens) => ({
  model: 'gemini-2.5-flash-image',
  inputTokens,
  outputTokens: images * TOKENS_PER_IMAGE,
  images,
})

test('one generated image costs $0.039 plus its input tokens', () => {
  // 281 input tokens at $0.30/1M = $0.0000843
  assert.equal(costUsd(image(1, 281)).toFixed(6), (0.039 + 0.0000843).toFixed(6))
})

test('image output bills per image, not per token', () => {
  // Same image count, wildly different input — output component must not move.
  const a = costUsd(image(1, 0))
  assert.equal(a, 0.039)
})

test('a three-angle product is $0.117 of image output', () => {
  assert.equal(Number(costUsd(image(3, 0)).toFixed(6)), 0.117)
})

test('text model bills both directions per token', () => {
  // The probe returned prompt 40 / candidates 18 on gemini-2.5-flash-lite.
  const cost = costUsd({
    model: 'gemini-2.5-flash-lite',
    inputTokens: 40,
    outputTokens: 18,
    images: 0,
  })
  assert.equal(cost.toFixed(10), (40 / 1e6 * 0.1 + 18 / 1e6 * 0.4).toFixed(10))
})

test('a listing batch of 500 rows stays in cents, not dollars', () => {
  const cost = costUsd({
    model: 'gemini-2.5-flash-lite',
    inputTokens: 500 * 400,
    outputTokens: 500 * 300,
    images: 0,
  })
  assert.ok(cost > 0 && cost < 0.1, `expected cents, got $${cost}`)
})

test('an uncatalogued model costs 0 instead of throwing', () => {
  assert.equal(costUsd({ model: 'gemini-9-future', inputTokens: 999, outputTokens: 999, images: 5 }), 0)
})

test('zero usage costs zero', () => {
  assert.equal(costUsd({ model: 'gemini-2.5-flash-image', inputTokens: 0, outputTokens: 0, images: 0 }), 0)
})
