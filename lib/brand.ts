// Turns a client's brand colour into the CSS variables the portal themes itself
// with. Pure (no framework imports) so it is unit-tested with plain node.

export const FLOW_GREEN = '#143c28'
const DARK_INK = '#10231a'

/** "#abc" / "ABCDEF" → "#aabbcc"; anything unusable falls back to FLOW green. */
export function normalizeHex(input: string | null | undefined): string {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((input ?? '').trim())
  if (!m) return FLOW_GREEN
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1]
  return `#${h.toLowerCase()}`
}

const channels = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]

/** WCAG relative luminance, 0 (black) – 1 (white). */
function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Text colour (white or near-black) that reads best on `bg`. */
export function readableOn(bg: string): string {
  const hex = normalizeHex(bg)
  return contrast(hex, '#ffffff') >= contrast(hex, DARK_INK) ? '#ffffff' : DARK_INK
}

/**
 * The brand colour darkened just enough to be readable as TEXT on white
 * (contrast ≥ 4.5), for active tabs and links when the brand is a pale colour.
 */
export function brandInk(color: string): string {
  let hex = normalizeHex(color)
  for (let i = 0; i < 20 && contrast(hex, '#ffffff') < 4.5; i++) {
    hex = `#${channels(hex)
      .map((v) => Math.round(v * 0.88).toString(16).padStart(2, '0'))
      .join('')}`
  }
  return hex
}

/** A <style> body that re-themes the shadcn tokens for one client. */
export function brandCss(color: string | null | undefined): string {
  const hex = normalizeHex(color)
  return `:root{--primary:${hex};--primary-foreground:${readableOn(hex)};--ring:${hex};--brand:${hex};--brand-ink:${brandInk(hex)}}`
}
