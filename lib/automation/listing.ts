import 'server-only'
import { generateListingFields, type GenField } from '@/lib/ai/gemini'
import type { AiUsage } from '@/lib/ai/pricing'
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

/**
 * Generate + assemble one output row for the chosen marketplace template.
 *
 * `usage` is an accumulator: what the call cost is pushed onto it the moment the
 * model responds, so spend is recorded even if this row later fails.
 */
export async function processListingRow(
  canonical: CanonicalRow,
  marketplaceKey: string,
  usage: AiUsage[],
): Promise<Record<string, string>> {
  const marketplace = getMarketplace(marketplaceKey) as Marketplace
  const genCols = marketplace.columns.filter((c) => c.generate)
  const fields: GenField[] = genCols.map((c) => ({
    key: c.header,
    label: c.header,
    description: c.guidance,
  }))

  const billed = await generateListingFields(canonical, fields, { marketplace: marketplace.name })
  usage.push(billed.usage)
  const generated = billed.value

  const out: Record<string, string> = {}
  for (const col of marketplace.columns) {
    if (col.generate) out[col.header] = generated[col.header] ?? ''
    else if (col.from) out[col.header] = String(canonical[col.from] ?? '')
    else out[col.header] = ''
  }
  return out
}
