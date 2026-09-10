import 'server-only'
import { generateStructured, type SchemaField } from '@/lib/ai/gemini'
import type { AiUsage } from '@/lib/ai/pricing'
import {
  BULLET_COUNT,
  KEYWORD_COUNT,
  emptyCollectingRow,
  type CollectingRow,
} from '@/lib/automation/collecting'
import {
  generateAsks,
  type AmazonTemplate,
  type TemplateField,
} from '@/lib/automation/amazon-template'
import {
  LIMITS,
  addReason,
  numeric,
  truncateAt,
  truncateBytes,
  validateEnum,
} from '@/lib/automation/listing-rules'

export { buildAmazonRow, type JobConstants } from '@/lib/automation/amazon-template'

const jsonKey = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'field'

// ── Stage A: receiving row -> collecting row ────────────────────────────────

const COLLECTING_FIELDS: SchemaField[] = [
  { key: 'title', description: `English Amazon title, max ${LIMITS.title} characters. Lead with brand, then product type, then the attributes a buyer searches on (capacity, material, pack count). No ALL CAPS, no promotional claims, no seller name.` },
  { key: 'description', description: `English product description, 2-4 short paragraphs, plain text with no HTML. Concrete and specific about what the product is and how it is used.` },
  { key: 'bullets', array: true, description: `Exactly ${BULLET_COUNT} bullet points. Each starts with a short benefit phrase, then the detail supporting it. Distinct from one another — no restating the title.` },
  { key: 'keywords', array: true, description: `Exactly ${KEYWORD_COUNT} back-end search keywords a buyer would actually type. Single words or short phrases, no punctuation, no repetition of words already in the title, no brand names of competitors.` },
  { key: 'length_cm', description: 'Longer horizontal edge in centimetres. Number only, no unit.' },
  { key: 'width_cm', description: 'Shorter horizontal edge in centimetres. Number only, no unit.' },
  { key: 'height_cm', description: 'Height from base to top in centimetres. Number only, no unit.' },
  { key: 'weight_kg', description: 'Weight in kilograms. Number only, no unit.' },
  { key: 'estimated', array: true, description: 'The keys of every field above whose value you estimated rather than read from the source title. Use the exact key names, e.g. length_cm, weight_kg.' },
]

const COLLECTING_INSTRUCTION =
  'You are an Amazon Egypt catalogue specialist. The source title is Arabic; everything you ' +
  'write must be in English (the marketplace template is en_AE). Translate meaning, do not ' +
  'transliterate word by word, and keep the brand name as it is written.\n\n' +
  'Physical specifications: if the source title states a capacity, dimension, weight or pack ' +
  'count, use it exactly. If it does not, give a realistic estimate for this kind of product ' +
  'AND list that field key in "estimated". Reporting an estimate as if it were measured is the ' +
  'one failure that matters here — "estimated" is almost never empty, because a title rarely ' +
  'states all four dimensions.\n\n' +
  'Never invent certifications, safety claims, awards, or compatibility with named brands.'

/**
 * Generate one collecting row from a receiving row.
 *
 * `brand` is the job's own answer, passed in so the title uses your spelling:
 * left to itself the model transliterates "بلاستيما" as Plastima, Plastema or
 * Blastema from one row to the next.
 */
export async function runCollecting(
  sku: string,
  orgTitle: string,
  usage: AiUsage[],
  brand?: string,
): Promise<CollectingRow> {
  const billed = await generateStructured(
    `Source product (from the supplier's receiving sheet):\nSKU: ${sku}\nArabic title: ${orgTitle}` +
      (brand ? `\nBrand (spell it exactly like this wherever you use it): ${brand}` : ''),
    COLLECTING_FIELDS,
    { systemInstruction: COLLECTING_INSTRUCTION },
  )
  usage.push(billed.usage)
  const g = billed.value

  const str = (k: string) => String(g[k] ?? '').trim()
  const arr = (k: string) => (Array.isArray(g[k]) ? (g[k] as string[]) : []).map((s) => String(s).trim())

  const row = emptyCollectingRow(sku, orgTitle)
  row.title = truncateAt(str('title'), LIMITS.title)
  row.description = truncateAt(str('description'), LIMITS.description)
  row.bullets = Array.from({ length: BULLET_COUNT }, (_, i) =>
    truncateAt(arr('bullets')[i] ?? '', LIMITS.bullet),
  )
  row.keywords = Array.from({ length: KEYWORD_COUNT }, (_, i) =>
    truncateBytes(arr('keywords')[i] ?? '', LIMITS.keywordBytes),
  )
  row.lengthCm = numeric(str('length_cm'))
  row.widthCm = numeric(str('width_cm'))
  row.heightCm = numeric(str('height_cm'))
  row.weightKg = numeric(str('weight_kg'))
  row.estimated = arr('estimated').filter(Boolean)

  // UPC can never be generated — a made-up barcode fails Amazon's checksum.
  row.upc = ''
  row.needsReview = addReason(row.needsReview, 'UPC missing')
  if (row.estimated.length === 0) {
    // The model claimed every spec came from the title. On a one-line Arabic
    // title that is not credible, so the row gets a human either way.
    row.needsReview = addReason(row.needsReview, 'specs reported as measured — verify')
  }
  return row
}

// ── Stage B: collecting row -> Amazon flat-file row ─────────────────────────

const AMAZON_INSTRUCTION =
  'You are filling an Amazon Egypt flat file for a product you have already written the ' +
  'listing copy for. Answer every attribute in English. Where a field offers a closed list of ' +
  'values you must pick from that list — pick the closest honest match, and if none of them ' +
  'describe this product, return an empty string rather than the nearest-looking option. ' +
  'Numeric fields take a bare number with no unit.'

/** The attribute questions this template asks, collapsed to one per label. */
export function amazonSchemaFields(template: AmazonTemplate): {
  fields: SchemaField[]
  asks: { key: string; slots: TemplateField[] }[]
} {
  const asks = generateAsks(template.fields).map((a) => ({
    key: jsonKey(a.label),
    label: a.label,
    slots: a.slots,
  }))
  const fields: SchemaField[] = asks.map((a) => {
    const f = a.slots[0]
    const many = a.slots.length > 1
    return {
      key: a.key,
      array: many,
      enum: f.values,
      description: [
        a.label,
        f.description,
        many ? `Up to ${a.slots.length} values, most important first.` : '',
      ]
        .filter(Boolean)
        .join(' — '),
    }
  })
  return { fields, asks }
}

/** Ask the model for the template's product attributes. */
export async function runAmazon(
  row: CollectingRow,
  template: AmazonTemplate,
  usage: AiUsage[],
): Promise<Record<string, string>> {
  const { fields, asks } = amazonSchemaFields(template)
  if (fields.length === 0) return {}

  const billed = await generateStructured(
    `Product:\nTitle: ${row.title}\nDescription: ${row.description}\n` +
      `Bullets:\n${row.bullets.filter(Boolean).map((b) => `- ${b}`).join('\n')}\n` +
      `Dimensions (cm): ${row.lengthCm} x ${row.widthCm} x ${row.heightCm}\n` +
      `Weight (kg): ${row.weightKg}\n` +
      `Original Arabic title: ${row.orgTitle}`,
    fields,
    { systemInstruction: AMAZON_INSTRUCTION },
  )
  usage.push(billed.usage)

  // Spread each answer across the columns sharing that label, re-validating
  // against the closed list even though the schema already forbade a miss.
  const out: Record<string, string> = {}
  for (const ask of asks) {
    const raw = billed.value[ask.key]
    const values = Array.isArray(raw) ? raw.map(String) : [String(raw ?? '')]
    ask.slots.forEach((slot, i) => {
      const v = validateEnum((values[i] ?? '').trim(), slot.values)
      if (v) out[slot.field] = v
    })
  }
  return out
}
