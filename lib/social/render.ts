import 'server-only'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Font data for the OG renderer.
 *
 * Satori needs raw font buffers and does not read CSS, so next/font is no help
 * here — and it emits woff2, which Satori cannot parse at all. `assets/fonts/`
 * holds WOFF1 static instances fetched from Google Fonts for exactly this.
 *
 * Static, not variable: Funnel Display ships as a variable font and Satori's
 * variable-axis support does not cover it, so 400 and 700 are separate files.
 * That is why the render templates only ever use those two weights.
 *
 * Read off disk at request time and memoised, mirroring how the chatbot loads
 * the handbook. Both need `outputFileTracingIncludes` in next.config.ts or the
 * files are missing in production only.
 *
 * Nothing else lives in this module. The template and size constants are in
 * `templates.ts` because the composer is a client component and needs them —
 * importing this file from the browser bundle fails the build, which is the
 * same hazard documented at the top of lib/constants.ts.
 */
const FONT_DIR = path.join(process.cwd(), 'assets', 'fonts')

export interface LoadedFont {
  name: string
  data: ArrayBuffer
  weight: 400 | 700
  style: 'normal'
}

let cache: LoadedFont[] | null = null

export async function loadBrandFonts(): Promise<LoadedFont[]> {
  if (cache) return cache

  const [displayRegular, displayBold, body] = await Promise.all([
    readFile(path.join(FONT_DIR, 'FunnelDisplay-Regular.woff')),
    readFile(path.join(FONT_DIR, 'FunnelDisplay-Bold.woff')),
    readFile(path.join(FONT_DIR, 'DidactGothic-Regular.woff')),
  ])

  const toArrayBuffer = (b: Buffer): ArrayBuffer =>
    b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer

  cache = [
    { name: 'Funnel Display', data: toArrayBuffer(displayRegular), weight: 400, style: 'normal' },
    { name: 'Funnel Display', data: toArrayBuffer(displayBold), weight: 700, style: 'normal' },
    { name: 'Didact Gothic', data: toArrayBuffer(body), weight: 400, style: 'normal' },
  ]
  return cache
}
