import sharp from 'sharp'

const CANVAS = 2000 // final square size
const PRODUCT_MAX = 1500 // product bounding box — 75% of the canvas, 250px white each side

/** Channel value at or above which a pixel counts as white. */
const WHITE = 245
/** RGB distance from the sampled backdrop that still counts as backdrop. */
const BG_TOLERANCE = 34
/** Looser second pass, applied only against already-cleared pixels, to kill the halo. */
const EDGE_TOLERANCE = 72
/** Below this share of white border pixels the frame is rejected rather than shipped. */
const MIN_BORDER_WHITE = 0.98
/** Above this fill share the product itself was eaten — reject too. */
const MAX_FILL = 0.99

interface Raw {
  data: Buffer
  width: number
  height: number
  channels: number
}

/** Share of the outer 1px ring that is white. */
function borderWhiteRatio({ data, width, height, channels }: Raw) {
  let total = 0
  let white = 0
  const at = (x: number, y: number) => {
    const i = (y * width + x) * channels
    total++
    if (data[i] >= WHITE && data[i + 1] >= WHITE && data[i + 2] >= WHITE) white++
  }
  for (let x = 0; x < width; x++) {
    at(x, 0)
    at(x, height - 1)
  }
  for (let y = 1; y < height - 1; y++) {
    at(0, y)
    at(width - 1, y)
  }
  return total ? white / total : 1
}

/** Per-channel median of the outer ring — a robust estimate of the backdrop colour. */
function sampleBackdrop({ data, width, height, channels }: Raw): [number, number, number] {
  const ch: [number[], number[], number[]] = [[], [], []]
  const push = (x: number, y: number) => {
    const i = (y * width + x) * channels
    ch[0].push(data[i])
    ch[1].push(data[i + 1])
    ch[2].push(data[i + 2])
  }
  for (let x = 0; x < width; x += 2) {
    push(x, 0)
    push(x, height - 1)
  }
  for (let y = 1; y < height - 1; y += 2) {
    push(0, y)
    push(width - 1, y)
  }
  return ch.map((v) => v.sort((a, b) => a - b)[v.length >> 1]) as [number, number, number]
}

/**
 * Replace a border-connected backdrop with pure white.
 *
 * The model is asked to remove the background but does not reliably do it — a
 * soft off-white studio backdrop often comes back untouched, and trim() can't
 * help because such a backdrop sits further from white than its threshold. So
 * trace the product deterministically instead: flood-fill inward from every
 * border pixel, taking anything within BG_TOLERANCE of the sampled backdrop.
 * Whatever survives is the object.
 *
 * Throws rather than returning a bad frame — a failed item is visible on the
 * job page and retryable; a grey rectangle silently shipped into the zip is not.
 *
 * ponytail: assumes the backdrop is border-connected and roughly uniform, which
 * is what catalog photos are. A busy or high-contrast scene fails the border
 * check and is rejected, by design. Real segmentation is the upgrade path.
 */
async function isolateOnWhite(raw: Buffer): Promise<Buffer> {
  // flatten drops alpha, toColourspace pins it at 3 channels — a greyscale source
  // would otherwise come back 1-channel and break every offset below.
  const { data, info } = await sharp(raw)
    .flatten({ background: '#ffffff' })
    .toColourspace('srgb')
    .raw()
    .toBuffer({ resolveWithObject: true })
  const channels = 3
  const img: Raw = { data, width: info.width, height: info.height, channels }
  const { width, height } = img

  // The model already produced a clean cut-out — leave it alone.
  if (borderWhiteRatio(img) >= MIN_BORDER_WHITE) return raw

  const [br, bg, bb] = sampleBackdrop(img)
  const near = (i: number, tol: number) => {
    const dr = data[i] - br
    const dg = data[i + 1] - bg
    const db = data[i + 2] - bb
    return dr * dr + dg * dg + db * db <= tol * tol
  }
  const paintWhite = (i: number) => {
    data[i] = 255
    data[i + 1] = 255
    data[i + 2] = 255
  }

  const filled = new Uint8Array(width * height)
  const stack = new Int32Array(width * height)
  let top = 0
  const push = (p: number) => {
    if (filled[p]) return
    const i = p * channels
    if (!near(i, BG_TOLERANCE)) return
    filled[p] = 1
    paintWhite(i)
    stack[top++] = p
  }

  for (let x = 0; x < width; x++) {
    push(x)
    push((height - 1) * width + x)
  }
  for (let y = 0; y < height; y++) {
    push(y * width)
    push(y * width + width - 1)
  }

  let count = 0
  while (top > 0) {
    const p = stack[--top]
    count++
    const x = p % width
    const y = (p / width) | 0
    if (x > 0) push(p - 1)
    if (x < width - 1) push(p + 1)
    if (y > 0) push(p - width)
    if (y < height - 1) push(p + width)
  }

  // De-fringe: one pass over pixels touching the cleared region, catching the
  // 1-2px band where the product edge blended into the old backdrop.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x
      if (filled[p]) continue
      const touches =
        (x > 0 && filled[p - 1]) ||
        (x < width - 1 && filled[p + 1]) ||
        (y > 0 && filled[p - width]) ||
        (y < height - 1 && filled[p + width])
      if (touches && near(p * channels, EDGE_TOLERANCE)) {
        filled[p] = 1
        paintWhite(p * channels)
        count++
      }
    }
  }

  if (count / (width * height) > MAX_FILL) {
    throw new Error(
      'The product could not be separated from its background — it is too close in colour to the backdrop. Reshoot on a contrasting surface.',
    )
  }

  const cleaned: Raw = { ...img, data }
  if (borderWhiteRatio(cleaned) < MIN_BORDER_WHITE) {
    throw new Error(
      'The background could not be removed cleanly — it is too busy or uneven. Reshoot the product on a plain surface.',
    )
  }

  return sharp(data, { raw: { width, height, channels } }).png().toBuffer()
}

/**
 * Deterministically standardize a generated image onto a pure-white square:
 * isolate the product from its backdrop, trim down to its bounding box, then
 * centre it on a fresh RGB(255,255,255) canvas. This guarantees a clean white
 * background + consistent framing regardless of what the model returned.
 */
export async function toWhiteCanvas(raw: Buffer): Promise<Buffer> {
  const isolated = await isolateOnWhite(raw)

  let product: Buffer
  try {
    product = await sharp(isolated)
      .flatten({ background: '#ffffff' })
      .trim({ background: '#ffffff', threshold: 22 })
      .resize(PRODUCT_MAX, PRODUCT_MAX, { fit: 'inside', withoutEnlargement: false })
      // Mild on purpose: trimmed products land on both sides of PRODUCT_MAX, so
      // this has to be safe when downsampling as well as upsampling.
      .sharpen({ sigma: 1 })
      .toBuffer()
  } catch {
    // trim can throw if the image is uniform; fall back to a plain contain resize.
    product = await sharp(isolated)
      .flatten({ background: '#ffffff' })
      .resize(PRODUCT_MAX, PRODUCT_MAX, { fit: 'inside' })
      .sharpen({ sigma: 1 })
      .toBuffer()
  }

  return sharp({
    create: { width: CANVAS, height: CANVAS, channels: 3, background: '#ffffff' },
  })
    .composite([{ input: product, gravity: 'center' }])
    .jpeg({ quality: 95, chromaSubsampling: '4:4:4' })
    .toBuffer()
}
