// Self-check for the portal helpers. Run: node --test lib/portal-helpers.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeHex, readableOn, brandInk, brandCss, contrast, FLOW_GREEN } from './brand.ts'
import { formatDate, formatTime } from './format.ts'
import { whatsappUrl } from './contact.ts'

test('hex normalising accepts 3/6 digits with or without #, otherwise falls back to FLOW green', () => {
  assert.equal(normalizeHex('#ABC'), '#aabbcc')
  assert.equal(normalizeHex('1A2B3C'), '#1a2b3c')
  assert.equal(normalizeHex('not-a-colour'), FLOW_GREEN)
  assert.equal(normalizeHex(null), FLOW_GREEN)
})

test('text on a dark brand is white, on a pale brand is dark', () => {
  assert.equal(readableOn('#143c28'), '#ffffff')
  assert.equal(readableOn('#ffe14d'), '#10231a')
})

test('a pale brand is darkened until it reads as text on white', () => {
  const ink = brandInk('#ffe14d')
  assert.ok(contrast(ink, '#ffffff') >= 4.5)
  assert.equal(brandInk('#143c28'), '#143c28') // already readable → untouched
})

test('brand css re-themes primary, ring and the brand variables', () => {
  const css = brandCss('#ffe14d')
  assert.match(css, /--primary:#ffe14d/)
  assert.match(css, /--primary-foreground:#10231a/)
  assert.match(css, /--ring:#ffe14d/)
})

test('dates use the viewer language with Latin digits', () => {
  assert.equal(formatDate('2026-10-20T12:00:00Z', 'en'), '20 Oct 2026')
  assert.match(formatDate('2026-10-20T12:00:00Z', 'ar'), /2026/)
  assert.match(formatTime('2026-10-20T13:05:00Z', 'en'), /\d{2}:\d{2}/)
})

test('whatsapp links accept local, +country and 00 formats', () => {
  assert.equal(whatsappUrl('01012345678'), 'https://wa.me/201012345678')
  assert.equal(whatsappUrl('+20 101 234 5678'), 'https://wa.me/201012345678')
  assert.equal(whatsappUrl('0020 101 234 5678'), 'https://wa.me/201012345678')
  assert.equal(whatsappUrl('12'), null)
  assert.equal(whatsappUrl(''), null)
  assert.equal(whatsappUrl('01012345678', 'Hi there'), 'https://wa.me/201012345678?text=Hi%20there')
})
