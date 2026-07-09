import 'server-only'
import { generateListingFields, type GenField } from '@/lib/ai/gemini'
import { getMarketplace, type CanonicalKey, type Marketplace } from '@/lib/automation/marketplaces'

/** A canonical row: the input row reduced to our canonical field keys via the mapping. */
export type CanonicalRow = Partial<Record<CanonicalKey, string>>

/** Reduce a raw input row to canonical fields using {canonicalKey -> inputHeader}. */
export function mapRowToCanonical(
  row: Record<string, string>,
  mapping: Partial<Record<CanonicalKey, string>>,
): CanonicalRow {
  const out: CanonicalRow = {}
  for (const [key, header] of Object.entries(mapping)) {
    if (header && row[header] != null) out[key as CanonicalKey] = String(row[header])
  }
  return out
}

/** Generate + assemble one output row for the chosen marketplace template. */
export async function processListingRow(
  canonical: CanonicalRow,
  marketplaceKey: string,
): Promise<Record<string, string>> {
  const marketplace = getMarketplace(marketplaceKey) as Marketplace
  const genCols = marketplace.columns.filter((c) => c.generate)
  const fields: GenField[] = genCols.map((c) => ({
    key: c.header,
    label: c.header,
    description: c.guidance,
  }))

  const generated = await generateListingFields(canonical, fields, { marketplace: marketplace.name })

  const out: Record<string, string> = {}
  for (const col of marketplace.columns) {
    if (col.generate) out[col.header] = generated[col.header] ?? ''
    else if (col.from) out[col.header] = String(canonical[col.from] ?? '')
    else out[col.header] = ''
  }
  return out
}
