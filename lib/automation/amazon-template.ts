// Relative with the .ts extension, not aliased: this module is imported
// directly by the node --test self-check, which resolves neither path aliases
// nor extensionless specifiers. Same reason scripts/check.ts does it.
import type { CollectingRow } from './collecting.ts'
import { validateEnum } from './listing-rules.ts'
import * as XLSX from 'xlsx'

/**
 * Amazon flat files are self-describing, so we never hardcode their schema.
 * Three sheets carry everything we need:
 *
 *   Template          row 3 group · row 4 label · row 5 field name · row 6 example,
 *                     data starts at row 7 (rows 1-2 are the encoded feed settings
 *                     and the "use ENGLISH" banner — both must survive untouched).
 *   Data Definitions  header on row 2; per field: description + Required?
 *   Valid Values      per label: the closed list of values Amazon will accept.
 *
 * Parsing them means a new product type — or a new marketplace using the same
 * flat-file format — works with no code change, and every enum answer is
 * constrained to Amazon's own list instead of free text its validator rejects.
 */

export type Requirement = 'Required' | 'Conditionally Required' | 'Recommended' | 'Optional'

export interface TemplateField {
  /** 0-based column index in the Template sheet. */
  col: number
  group: string
  label: string
  /** The machine name Amazon actually reads (row 5). */
  field: string
  example?: string
  requirement: Requirement
  description?: string
  /** Closed list of accepted values, when this field is an enum. */
  values?: string[]
  /** 0-based position among columns sharing this label (Bullet Point #1..#5). */
  occurrence: number
}

export interface AmazonTemplate {
  fields: TemplateField[]
  productType: string
  /** Sheet the data rows go into, and the first data row (1-based). */
  sheetName: string
  firstDataRow: number
}

/** Row indices (0-based) of the Template sheet's header block. */
const GROUP_ROW = 2
const LABEL_ROW = 3
const FIELD_ROW = 4
const EXAMPLE_ROW = 5
export const FIRST_DATA_ROW = 7 // 1-based, matches the example row sitting on row 6

function findSheet(wb: XLSX.WorkBook, name: string): string {
  const hit = wb.SheetNames.find((s) => s.toLowerCase() === name.toLowerCase())
  if (!hit) {
    throw new Error(
      `This does not look like an Amazon flat file — it has no "${name}" sheet. ` +
        `Download the template from Seller Central and upload it unmodified.`,
    )
  }
  return hit
}

function rowsOf(ws: XLSX.WorkSheet): string[][] {
  return XLSX.utils
    .sheet_to_json<unknown[]>(ws, { header: 1, blankrows: true, defval: '', raw: false })
    .map((r) => (r as unknown[]).map((c) => (c == null ? '' : String(c).trim())))
}

/** Valid Values labels arrive as `Material - [ FOOD_STORAGE_CONTAINER ]`. */
function stripValuesSuffix(label: string): string {
  return label.replace(/\s*-\s*\[[^\]]*\]\s*$/, '').trim()
}

export function parseAmazonTemplate(buf: Buffer): AmazonTemplate {
  const wb = XLSX.read(buf, { type: 'buffer', sheetStubs: true })

  // ── Template: the column layout ───────────────────────────────────────────
  const sheetName = findSheet(wb, 'Template')
  const ws = wb.Sheets[sheetName]
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1:A1')
  const cell = (r: number, c: number) => {
    const v = ws[XLSX.utils.encode_cell({ r, c })]?.v
    return v == null ? '' : String(v).trim()
  }

  const seen = new Map<string, number>()
  const fields: TemplateField[] = []
  let group = ''
  for (let c = range.s.c; c <= range.e.c; c++) {
    // Row 3 only marks where a group starts, so carry it forward.
    group = cell(GROUP_ROW, c) || group
    const label = cell(LABEL_ROW, c)
    const field = cell(FIELD_ROW, c)
    if (!field) continue
    const occurrence = seen.get(label) ?? 0
    seen.set(label, occurrence + 1)
    fields.push({
      col: c,
      group,
      label,
      field,
      example: cell(EXAMPLE_ROW, c) || undefined,
      requirement: 'Optional',
      occurrence,
    })
  }
  if (fields.length === 0) throw new Error('The Template sheet has no field-name row.')

  // ── Data Definitions: requirement + description, joined on field name ─────
  const defs = rowsOf(wb.Sheets[findSheet(wb, 'Data Definitions')])
  const byField = new Map<string, { requirement: Requirement; description?: string }>()
  for (const r of defs.slice(2)) {
    const name = r[1]
    if (!name) continue // group-heading rows carry a name in col A only
    byField.set(name, {
      requirement: (r[5] as Requirement) || 'Optional',
      description: r[3] || undefined,
    })
  }

  // ── Valid Values: the enum lists, joined on label ─────────────────────────
  // Keyed by group+label first so a label reused across groups keeps its own
  // list, with a label-only fallback for the (common) unambiguous case.
  const byGroupLabel = new Map<string, string[]>()
  const byLabel = new Map<string, string[]>()
  let vvGroup = ''
  for (const r of rowsOf(wb.Sheets[findSheet(wb, 'Valid Values')])) {
    vvGroup = r[0] || vvGroup
    if (!r[1]) continue
    const label = stripValuesSuffix(r[1])
    const values = r.slice(2).filter(Boolean)
    if (values.length === 0) continue
    byGroupLabel.set(`${vvGroup}||${label}`, values)
    if (!byLabel.has(label)) byLabel.set(label, values)
  }

  for (const f of fields) {
    const def = byField.get(f.field)
    if (def) {
      f.requirement = def.requirement
      f.description = def.description
    }
    f.values = byGroupLabel.get(`${f.group}||${f.label}`) ?? byLabel.get(f.label)
  }

  const productType = fields.find((f) => f.label === 'Product Type')?.values?.[0] ?? ''

  return { fields, productType, sheetName, firstDataRow: FIRST_DATA_ROW }
}

// ── Fill policy ─────────────────────────────────────────────────────────────
// Which of the 260 columns we actually fill, and from where. Not all of them:
// "League Name" and "Battery IEC Code" on a lunchbox are noise, and a 100-field
// JSON schema measurably degrades what the model writes. Everything below is a
// plain const so tuning the policy is an edit, not a code change.

export type Bucket = 'constant' | 'direct' | 'generate' | 'skip'

/** Flat listings only (user's call), and images come from the image automation. */
export const SKIP_GROUPS = ['Variations', 'Images']

/** The one group worth asking the model about. */
export const GENERATE_GROUPS = ['Product Details']

/** Facts about the business, asked once per job. label -> constants key. */
export const CONSTANT_LABELS: Record<string, string> = {
  'Product Type': 'productType',
  'Listing Action': 'listingAction',
  'Brand Name': 'brand',
  Manufacturer: 'brand',
  'Product Id Type': 'productIdType',
  'Recommended Browse Nodes': 'browseNode',
  'Country of Origin': 'countryOfOrigin',
  'Item Condition': 'condition',
  'List Price Currency': 'currency',
  'Dangerous Goods Regulations': 'dangerousGoods',
  // No price is collected, so listings are created without an offer rather than
  // with a blank one, which Amazon rejects.
  'Skip Offer': 'skipOffer',
}

/** Straight from the collecting sheet. label -> (row, occurrence) -> value. */
export const DIRECT_LABELS: Record<string, (r: DirectSource, i: number) => string> = {
  SKU: (r) => r.sku,
  'Model Number': (r) => r.sku,
  'Item Name': (r) => r.title,
  'Product Description': (r) => r.description,
  'Bullet Point': (r, i) => r.bullets[i] ?? '',
  'Generic Keyword': (r, i) => r.keywords[i] ?? '',
  'Product Id': (r) => r.upc,
  'Length longer horizontal edge': (r) => r.lengthCm,
  'Width shorter horizontal edge': (r) => r.widthCm,
  'Height base to top': (r) => r.heightCm,
}

export interface DirectSource {
  sku: string
  title: string
  description: string
  bullets: string[]
  keywords: string[]
  upc: string
  lengthCm: string
  widthCm: string
  heightCm: string
  weightKg: string
}

/** Optional on paper, but the attributes that make a container listing findable. */
export const EXTRA_GENERATE_LABELS = new Set([
  'Material', 'Material Features', 'Material Type Free', 'Special Features', 'Capacity',
  'Capacity Unit', 'Color', 'Size', 'Item Shape', 'Container Shape', 'Lid Material',
  'Closure Type', 'Care Instructions', 'Is the item dishwasher safe?',
  'Is the item microwaveable?', 'Is Transparent', 'Number of Items', 'Number of Packs',
  'Item Package Quantity', 'Unit Count', 'Unit Count Type', 'Included Components',
  'Food Storage Container Airtightness', 'Specific Uses For Product',
  'Recommended Uses For Product', 'Item Form',
])

/** Never worth a token on this catalogue. */
export const EXCLUDE_LABELS = new Set([
  'League Name', 'Team Name', 'Sport Type', 'Release Date', 'Product Site Launch Date',
  'Collection Item', 'Set Name', 'Is Green Purchasing Law Compliant', 'Orientation',
])

const isDimensionUnit = (label: string) => /^(Length|Width|Height) Unit$/.test(label)
const isWeightValue = (label: string) => /\bweight$/i.test(label)
const isWeightUnit = (label: string) => /\bweight unit$/i.test(label)

/**
 * Pick the enum member matching a unit we want (centimetres, kilograms). Falls
 * back to the plain word when the field has no closed list.
 */
export function snapUnit(f: TemplateField, wanted: RegExp, fallback: string): string {
  return f.values?.find((v) => wanted.test(v)) ?? fallback
}

export function bucketOf(f: TemplateField): Bucket {
  if (SKIP_GROUPS.includes(f.group) || EXCLUDE_LABELS.has(f.label)) return 'skip'
  if (CONSTANT_LABELS[f.label]) return f.occurrence === 0 ? 'constant' : 'skip'
  if (DIRECT_LABELS[f.label] || isDimensionUnit(f.label) || isWeightValue(f.label) || isWeightUnit(f.label)) {
    return 'direct'
  }
  if (!GENERATE_GROUPS.includes(f.group)) return 'skip'
  return f.requirement !== 'Optional' || EXTRA_GENERATE_LABELS.has(f.label) ? 'generate' : 'skip'
}

/** Resolve a `direct` field's value for one collecting row. */
export function directValue(f: TemplateField, r: DirectSource): string {
  const fn = DIRECT_LABELS[f.label]
  if (fn) return fn(r, f.occurrence)
  if (isDimensionUnit(f.label)) return snapUnit(f, /centimet/i, 'Centimeters')
  if (isWeightUnit(f.label)) return snapUnit(f, /kilogram/i, 'Kilograms')
  if (isWeightValue(f.label)) return r.weightKg
  return ''
}

/**
 * The generate bucket, collapsed to one ask per label. Multi-slot labels
 * (Bullet Point x5, Material x5) become a single array question rather than
 * five near-identical ones — narrower schema, better answers.
 */
export function generateAsks(fields: TemplateField[]): { label: string; slots: TemplateField[] }[] {
  const byLabel = new Map<string, TemplateField[]>()
  for (const f of fields) {
    if (bucketOf(f) !== 'generate') continue
    const list = byLabel.get(f.label)
    if (list) list.push(f)
    else byLabel.set(f.label, [f])
  }
  return [...byLabel].map(([label, slots]) => ({ label, slots }))
}

/** Job-level answers, keyed by the values in CONSTANT_LABELS. */
export type JobConstants = Record<string, string>

/**
 * Assemble the flat-file row. Returns values indexed by Template column, which
 * is what SheetJS writes straight into the sheet.
 */
export function buildAmazonRow(
  template: AmazonTemplate,
  row: CollectingRow,
  constants: JobConstants,
  generated: Record<string, string>,
): string[] {
  const cells: string[] = []
  for (const f of template.fields) {
    let value = ''
    switch (bucketOf(f)) {
      case 'constant':
        value = validateEnum(constants[CONSTANT_LABELS[f.label]] ?? '', f.values)
        break
      case 'direct':
        value = directValue(f, {
          sku: row.sku,
          title: row.title,
          description: row.description,
          bullets: row.bullets,
          keywords: row.keywords,
          upc: row.upc,
          lengthCm: row.lengthCm,
          widthCm: row.widthCm,
          heightCm: row.heightCm,
          weightKg: row.weightKg,
        })
        break
      case 'generate':
        value = generated[f.field] ?? ''
        break
    }
    cells[f.col] = value
  }
  for (let i = 0; i < cells.length; i++) cells[i] ??= ''
  return cells
}
