// Self-check for the deterministic framing step that both image automations
// share. Run: node --test lib/automation/image.test.mjs
// (Node >= 22.18 strips the types in image.ts on import — no build step.)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import { toWhiteCanvas } from './image.ts'

const CANVAS = 2000

/** Noisy, slightly uneven backdrop — what a real studio shot looks like. */
async function backdrop(width, height, hex, spread = 6) {
  const base = await sharp({ create: { width, height, channels: 3, background: hex } })
    .raw()
    .toBuffer({ resolveWithObject: true })
  for (let i = 0; i < base.data.length; i++) {
    const n = Math.round((Math.sin(i * 0.37) + Math.sin(i * 0.11)) * spread * 0.5)
    base.data[i] = Math.min(255, Math.max(0, base.data[i] + n))
  }
  return sharp(base.data, { raw: { width, height, channels: 3 } }).png().toBuffer()
}

/** A product sitting on a backdrop of the given colour. */
async function onBackdrop(hex, productHex = '#2fbfa4') {
  const product = await sharp({ create: { width: 300, height: 220, channels: 3, background: productHex } })
    .png()
    .toBuffer()
  return sharp(await backdrop(700, 700, hex))
    .composite([{ input: product, top: 240, left: 200 }])
    .jpeg({ quality: 95 })
    .toBuffer()
}

/** 400x600 white frame with a small red block pushed into the top-left corner. */
async function offCentreFixture() {
  const block = await sharp({
    create: { width: 80, height: 120, channels: 3, background: '#c00000' },
  })
    .png()
    .toBuffer()
  return sharp({ create: { width: 400, height: 600, channels: 3, background: '#ffffff' } })
    .composite([{ input: block, top: 20, left: 30 }])
    .png()
    .toBuffer()
}

async function pixel(raw, x, y) {
  const i = (y * CANVAS + x) * 3
  return [raw[i], raw[i + 1], raw[i + 2]]
}

test('off-centre product lands centred on a 2000px white square', async () => {
  const out = await toWhiteCanvas(await offCentreFixture())
  const { data, info } = await sharp(out).raw().toBuffer({ resolveWithObject: true })

  assert.equal(info.width, CANVAS)
  assert.equal(info.height, CANVAS)

  // Corners must be pure white — proves the flatten + white canvas fill.
  for (const [x, y] of [[2, 2], [CANVAS - 3, 2], [2, CANVAS - 3], [CANVAS - 3, CANVAS - 3]]) {
    assert.deepEqual(await pixel(data, x, y), [255, 255, 255], `corner ${x},${y} is not white`)
  }

  // Centre must be the product — proves trim dropped the white margin and
  // recentred it, instead of leaving it up in the top-left where it started.
  const [r, g, b] = await pixel(data, CANVAS / 2, CANVAS / 2)
  assert.ok(r > 150 && g < 80 && b < 80, `centre is not the product: rgb(${r},${g},${b})`)

  // Pin the margin itself. The 80x120 fixture fits the 1500 box as exactly
  // 1000x1500, so the product spans y 250→1750 and x 500→1500. ~15px of slack
  // absorbs JPEG edge bleed. Fails if PRODUCT_MAX or the centring drifts.
  const isRed = ([r, g, b]) => r > 150 && g < 80 && b < 80
  const isWhite = (px) => px.every((c) => c > 245)

  assert.ok(isWhite(await pixel(data, 1000, 235)), 'no white margin above the product')
  assert.ok(isRed(await pixel(data, 1000, 270)), 'product does not start at the 250px margin')
  assert.ok(isWhite(await pixel(data, 485, 1000)), 'no white margin left of the product')
  assert.ok(isRed(await pixel(data, 515, 1000)), 'product does not start at the 500px inset')
})

// This is the reported failure: the model leaves a pale backdrop in place, and
// it sits ~32 from white — past trim()'s threshold, so it used to survive to
// the zip as a grey rectangle on a white square.
test('a pale backdrop the model left behind is removed, not shipped', async () => {
  const out = await toWhiteCanvas(await onBackdrop('#dfe4ea'))
  const { data, info } = await sharp(out).raw().toBuffer({ resolveWithObject: true })
  const px = (x, y) => { const i = (y * info.width + x) * 3; return [data[i], data[i + 1], data[i + 2]] }

  for (const [x, y] of [[3, 3], [CANVAS - 4, 3], [3, CANVAS - 4], [CANVAS - 4, CANVAS - 4]]) {
    assert.ok(px(x, y).every((c) => c > 245), `corner ${x},${y} kept the backdrop: rgb(${px(x, y)})`)
  }
  // Nothing anywhere on the canvas may still be backdrop-coloured.
  let backdropPixels = 0
  for (let i = 0; i < data.length; i += 3) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
    if (Math.abs(r - 0xdf) < 10 && Math.abs(g - 0xe4) < 10 && Math.abs(b - 0xea) < 10) backdropPixels++
  }
  assert.ok(backdropPixels < 500, `${backdropPixels} backdrop-coloured pixels survived`)

  // ...and the product itself is still there, centred.
  const [r, g, b] = px(CANVAS / 2, CANVAS / 2)
  assert.ok(g > 120 && g > r && b > r, `product missing at centre: rgb(${r},${g},${b})`)
})

test('a mid-grey backdrop is removed too', async () => {
  const out = await toWhiteCanvas(await onBackdrop('#9aa3ad'))
  const { data } = await sharp(out).raw().toBuffer({ resolveWithObject: true })
  assert.ok([data[0], data[1], data[2]].every((c) => c > 245), 'corner kept the grey backdrop')
})

test('rejects rather than ships when the product matches the backdrop', async () => {
  const blank = await onBackdrop('#2fbfa4', '#2fbfa4')
  await assert.rejects(
    () => toWhiteCanvas(blank),
    /could not be separated|could not be removed/,
    'a product indistinguishable from its backdrop must fail the item, not ship blank',
  )
})
