/**
 * Pure guardrails for generated listing data.
 *
 * Kept free of `server-only` and of any Gemini import so the self-check can run
 * them under `node --test`, the same reason image-paths.ts is split out of
 * image.ts. Everything here is enforced in code rather than asked for in the
 * prompt: a model that is told "max 200 characters" still overshoots, and
 * Amazon rejects the whole row when it does.
 */

/** Amazon EG flat-file limits. */
export const LIMITS = {
  title: 200,
  bullet: 500,
  description: 2000,
  /** Per generic_keyword cell, measured in bytes. */
  keywordBytes: 50,
} as const

/** A title this thin cannot support an honest listing. Tuned on the real sheet:
 *  "بلاستيما سناك بوكس" (3 tokens) is flagged, an 8-token title is not. */
export const MIN_TITLE_TOKENS = 4

const bytes = (s: string) => new TextEncoder().encode(s).length

/** Truncate to `max` characters at a word boundary, never mid-word. */
export function truncateAt(text: string, max: number): string {
  const t = text.trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return (space > max * 0.6 ? cut.slice(0, space) : cut).trim()
}

/** Same, but bounded in bytes — keywords are byte-limited, not char-limited. */
export function truncateBytes(text: string, maxBytes: number): string {
  let t = text.trim()
  if (bytes(t) <= maxBytes) return t
  while (t.length > 0 && bytes(t) > maxBytes) t = t.slice(0, -1)
  const space = t.lastIndexOf(' ')
  return (space > 0 ? t.slice(0, space) : t).trim()
}

/**
 * Snap a value onto the field's closed list. The response schema already
 * forbids off-list values; this catches the case where it slips through, so a
 * junk value is dropped rather than shipped to Amazon and bounced.
 */
export function validateEnum(value: string, values?: string[]): string {
  const v = value.trim()
  if (!v || !values?.length) return v
  const exact = values.find((o) => o === v)
  if (exact) return exact
  const ci = values.find((o) => o.toLowerCase() === v.toLowerCase())
  return ci ?? ''
}

/** Pull a bare number out of "12.5 cm" / "1.6 لتر". Empty when there isn't one. */
export function numeric(value: string): string {
  const m = String(value).replace(',', '.').match(/-?\d+(\.\d+)?/)
  return m ? m[0] : ''
}

const normalizeTitle = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase()

const tokenCount = (s: string) =>
  s.trim().split(/\s+/).filter((w) => w.replace(/[^\p{L}\p{N}]/gu, '').length >= 2).length

/**
 * Rows needing a human, decided before any tokens are spent.
 *
 * Duplicate titles are the expensive failure: four SKUs sharing one title
 * generate four identical listings that Amazon treats as unrelated products.
 * Returns a reason per index, empty string when the row is clean.
 */
export function reviewReasons(titles: string[]): string[] {
  const counts = new Map<string, number>()
  for (const t of titles) {
    const k = normalizeTitle(t)
    if (k) counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return titles.map((t) => {
    const reasons: string[] = []
    if (!t.trim()) reasons.push('missing title')
    else {
      if (tokenCount(t) < MIN_TITLE_TOKENS) reasons.push('title too thin to describe the product')
      if ((counts.get(normalizeTitle(t)) ?? 0) > 1) reasons.push('title duplicated on another SKU')
    }
    return reasons.join('; ')
  })
}

/** Append a reason to an existing flag without duplicating it. */
export function addReason(existing: string, reason: string): string {
  if (!reason) return existing
  const parts = existing ? existing.split('; ') : []
  if (!parts.includes(reason)) parts.push(reason)
  return parts.join('; ')
}

/**
 * Guess which receiving-sheet columns hold the SKU and the supplier title.
 * Shared so the wizard's preview and the server's job creation agree — a
 * client-side copy of these regexes would drift and silently map the wrong
 * column.
 */
export function detectReceivingColumns(headers: string[]): { sku: string; title: string } {
  const find = (re: RegExp) => headers.find((h) => re.test(h.trim()))
  return {
    sku: find(/sku|item.?id|\bcode\b/i) ?? headers[0] ?? '',
    title: find(/title|name|description/i) ?? headers[1] ?? '',
  }
}
