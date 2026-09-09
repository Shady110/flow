import * as XLSX from 'xlsx'

/**
 * The collecting sheet: enriched product data sitting between the supplier's
 * receiving sheet and the Amazon flat file.
 *
 * Two columns are ours, not the original template's:
 *
 *   SKU              the template joined on Org Title alone, but titles repeat
 *                    across SKUs (PLS-008..011 all read "بلاستيما سناك بوكس"),
 *                    so a title join silently merges distinct products.
 *   Estimated Fields the values the model inferred rather than read from the
 *   / Needs Review   title, and why a row wants a human. Guesses are allowed —
 *                    guesses that look like facts are not.
 */

export const BULLET_COUNT = 5
export const KEYWORD_COUNT = 5

export const COLLECTING_COLUMNS = [
  'SKU',
  'Org Title',
  'UPC',
  'Title',
  'Description',
  ...Array.from({ length: BULLET_COUNT }, (_, i) => `B.P${i + 1}`),
  'Length (cm)',
  'Width (cm)',
  'Height (cm)',
  'Weight (kg)',
  ...Array.from({ length: KEYWORD_COUNT }, (_, i) => `Keyword ${i + 1}`),
  'Estimated Fields',
  'Needs Review',
] as const

export interface CollectingRow {
  sku: string
  orgTitle: string
  upc: string
  title: string
  description: string
  bullets: string[]
  lengthCm: string
  widthCm: string
  heightCm: string
  weightKg: string
  keywords: string[]
  /** Keys whose value the model inferred rather than read from the title. */
  estimated: string[]
  /** Empty when the row is clean; otherwise why it needs a human. */
  needsReview: string
}

export function emptyCollectingRow(sku = '', orgTitle = ''): CollectingRow {
  return {
    sku,
    orgTitle,
    upc: '',
    title: '',
    description: '',
    bullets: Array(BULLET_COUNT).fill(''),
    lengthCm: '',
    widthCm: '',
    heightCm: '',
    weightKg: '',
    keywords: Array(KEYWORD_COUNT).fill(''),
    estimated: [],
    needsReview: '',
  }
}

function toRecord(r: CollectingRow): Record<string, string> {
  const out: Record<string, string> = {
    SKU: r.sku,
    'Org Title': r.orgTitle,
    UPC: r.upc,
    Title: r.title,
    Description: r.description,
    'Length (cm)': r.lengthCm,
    'Width (cm)': r.widthCm,
    'Height (cm)': r.heightCm,
    'Weight (kg)': r.weightKg,
    'Estimated Fields': r.estimated.join(', '),
    'Needs Review': r.needsReview,
  }
  for (let i = 0; i < BULLET_COUNT; i++) out[`B.P${i + 1}`] = r.bullets[i] ?? ''
  for (let i = 0; i < KEYWORD_COUNT; i++) out[`Keyword ${i + 1}`] = r.keywords[i] ?? ''
  return out
}

export function buildCollectingSheet(rows: CollectingRow[]): Buffer {
  const headers = [...COLLECTING_COLUMNS]
  const ws = XLSX.utils.json_to_sheet(rows.map(toRecord), { header: headers })
  ws['!cols'] = headers.map((h) => ({ wch: h === 'Description' ? 60 : h.startsWith('B.P') ? 40 : 18 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Collecting')
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}

/**
 * Read a collecting sheet back in — the re-upload path, where a corrected
 * 1000-row batch feeds the Amazon stage without regenerating (or re-paying for)
 * anything. Tolerant of edits: unknown columns are ignored, missing ones blank.
 */
export function parseCollectingSheet(buf: Buffer): CollectingRow[] {
  const wb = XLSX.read(buf, { type: 'buffer' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  if (!ws) return []
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '', raw: false })

  return raw
    .map((r) => {
      const get = (k: string) => String(r[k] ?? '').trim()
      const row = emptyCollectingRow(get('SKU'), get('Org Title'))
      row.upc = get('UPC')
      row.title = get('Title')
      row.description = get('Description')
      row.lengthCm = get('Length (cm)')
      row.widthCm = get('Width (cm)')
      row.heightCm = get('Height (cm)')
      row.weightKg = get('Weight (kg)')
      row.bullets = Array.from({ length: BULLET_COUNT }, (_, i) => get(`B.P${i + 1}`))
      row.keywords = Array.from({ length: KEYWORD_COUNT }, (_, i) => get(`Keyword ${i + 1}`))
      row.estimated = get('Estimated Fields').split(',').map((s) => s.trim()).filter(Boolean)
      row.needsReview = get('Needs Review')
      return row
    })
    .filter((r) => r.sku || r.title || r.orgTitle)
}
