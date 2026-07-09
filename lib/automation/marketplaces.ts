// Marketplace export templates. Config-driven so new marketplaces (or exact
// official upload-sheet headers) can be added without touching the pipeline.
//
// NOTE: the exact column headers required by each seller centre change over time.
// These are sensible, common sets; drop in an official template's headers to map
// 1:1 when needed.

export const CANONICAL_FIELDS = [
  'sku',
  'name',
  'brand',
  'category',
  'price',
  'color',
  'material',
  'dimensions',
  'weight',
  'notes',
] as const

export type CanonicalKey = (typeof CANONICAL_FIELDS)[number]

export const CANONICAL_LABELS: Record<CanonicalKey, string> = {
  sku: 'SKU / ID',
  name: 'Product name',
  brand: 'Brand',
  category: 'Category',
  price: 'Price',
  color: 'Color',
  material: 'Material',
  dimensions: 'Dimensions',
  weight: 'Weight',
  notes: 'Raw features / notes',
}

export interface OutputColumn {
  header: string // exact column header in the exported sheet
  from?: CanonicalKey // passthrough from a mapped source column
  generate?: boolean // AI generates this field
  required?: boolean
  guidance?: string // instruction handed to the model
}

export interface Marketplace {
  key: string
  name: string
  columns: OutputColumn[]
}

const SHARED_GENERATED: OutputColumn[] = [
  { header: 'title', generate: true, required: true, guidance: 'Compelling SEO title, max 200 characters, include brand + key attributes.' },
  { header: 'description', generate: true, required: true, guidance: 'Persuasive HTML-free product description, 2–4 short paragraphs.' },
  { header: 'bullet_point_1', generate: true, guidance: 'Key benefit/feature, concise.' },
  { header: 'bullet_point_2', generate: true, guidance: 'Key benefit/feature, concise.' },
  { header: 'bullet_point_3', generate: true, guidance: 'Key benefit/feature, concise.' },
  { header: 'bullet_point_4', generate: true, guidance: 'Key benefit/feature, concise.' },
  { header: 'bullet_point_5', generate: true, guidance: 'Key benefit/feature, concise.' },
  { header: 'search_keywords', generate: true, guidance: 'Comma-separated relevant search keywords, no repetition of the title.' },
  { header: 'size', generate: true, guidance: 'Normalized dimensions in centimetres (L x W x H), else empty.' },
  { header: 'weight', generate: true, guidance: 'Normalized weight in kilograms, else empty.' },
]

export const MARKETPLACES: Marketplace[] = [
  {
    key: 'amazon',
    name: 'Amazon',
    columns: [
      { header: 'item_sku', from: 'sku', required: true },
      { header: 'brand_name', from: 'brand' },
      { header: 'standard_price', from: 'price' },
      { header: 'color_name', from: 'color' },
      { header: 'material_type', from: 'material' },
      ...SHARED_GENERATED,
    ],
  },
  {
    key: 'noon',
    name: 'Noon',
    columns: [
      { header: 'partner_sku', from: 'sku', required: true },
      { header: 'brand', from: 'brand' },
      { header: 'msrp_ae', from: 'price' },
      { header: 'color', from: 'color' },
      { header: 'material', from: 'material' },
      ...SHARED_GENERATED,
    ],
  },
  {
    key: 'jumia',
    name: 'Jumia',
    columns: [
      { header: 'SellerSKU', from: 'sku', required: true },
      { header: 'Brand', from: 'brand' },
      { header: 'Price', from: 'price' },
      { header: 'Color', from: 'color' },
      { header: 'MainMaterial', from: 'material' },
      ...SHARED_GENERATED,
    ],
  },
]

export function getMarketplace(key: string): Marketplace | undefined {
  return MARKETPLACES.find((m) => m.key === key)
}
