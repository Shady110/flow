// Self-check for the listing pipeline's pure parts.
// Run: node --test lib/automation/listing.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as XLSX from 'xlsx'
import {
  parseAmazonTemplate,
  bucketOf,
  directValue,
  generateAsks,
  buildAmazonRow,
} from './amazon-template.ts'
import { buildCollectingSheet, parseCollectingSheet, emptyCollectingRow } from './collecting.ts'
import { writeIntoTemplate } from './xlsx.ts'
import {
  LIMITS,
  truncateAt,
  truncateBytes,
  validateEnum,
  numeric,
  reviewReasons,
  addReason,
} from './listing-rules.ts'

/**
 * A miniature Amazon flat file with the same shape as the real one: settings on
 * row 1, the banner on row 2, group/label/field/example on rows 3-6, data from
 * row 7, plus the Data Definitions and Valid Values sheets it joins against.
 */
function makeTemplate() {
  const template = [
    ['settings=feedType=256&timestamp=X', 'settings2=abc'],
    ['     Use ENGLISH to fill this template. DO NOT modify or delete.'],
    ['Listing Identity', '', 'Product Identity', 'Product Details', '', '', '', '', '', '', 'Images'],
    ['SKU', 'Product Type', 'Item Name', 'Bullet Point', 'Bullet Point', 'Material', 'Material', 'Height base to top', 'Height Unit', 'League Name', 'Main Image URL'],
    ['contribution_sku#1.value', 'product_type#1.value', 'item_name#1.value', 'bullet_point#1.value', 'bullet_point#2.value', 'material#1.value', 'material#2.value', 'ilwh#1.height.value', 'ilwh#1.height.unit', 'league_name#1.value', 'main_image#1.media'],
    ['ABC123', 'ACCESSORY', 'Adidas Blue Sneakers', 'Breathable', 'Breathable', 'Plastic', 'Plastic', '12.9', 'Centimeters', 'NBA', 'http://x/y.jpg'],
  ]
  const defs = [
    ['How to complete your inventory template'],
    ['Group Name', 'Field Name', 'Local Label Name', 'Accepted Values', 'Example', 'Required?'],
    ['Listing Identity', '', '', '', '', ''],
    ['', 'contribution_sku#1.value', 'SKU', 'The SKU as assigned by the contributor', 'ABC123', 'Required'],
    ['', 'product_type#1.value', 'Product Type', 'The product type', 'ACCESSORY', 'Required'],
    ['', 'item_name#1.value', 'Item Name', 'Customer facing title', 'Sneakers', 'Required'],
    ['Product Details', '', '', '', '', ''],
    ['', 'bullet_point#1.value', 'Bullet Point', 'A key feature', 'Breathable', 'Required'],
    ['', 'bullet_point#2.value', 'Bullet Point', 'A key feature', 'Breathable', 'Required'],
    ['', 'material#1.value', 'Material', 'What it is made of', 'Plastic', 'Optional'],
    ['', 'material#2.value', 'Material', 'What it is made of', 'Plastic', 'Optional'],
    ['', 'ilwh#1.height.value', 'Height base to top', 'Height', '12.9', 'Optional'],
    ['', 'ilwh#1.height.unit', 'Height Unit', 'Height unit', 'Centimeters', 'Optional'],
    ['', 'league_name#1.value', 'League Name', 'Sports league', 'NBA', 'Optional'],
    ['', 'main_image#1.media', 'Main Image URL', 'Main image', 'http://x', 'Required'],
  ]
  const valid = [
    ['Listing Identity', '', ''],
    ['', 'Product Type - [  ]', 'FOOD_STORAGE_CONTAINER'],
    ['Product Details', '', ''],
    ['', 'Material - [ FOOD_STORAGE_CONTAINER ]', 'Plastic', 'Glass', 'Silicone'],
    ['', 'Height Unit - [ FOOD_STORAGE_CONTAINER ]', 'Inches', 'Centimeters'],
    ['', 'League Name - [ FOOD_STORAGE_CONTAINER ]', 'NBA'],
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(template), 'Template')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(defs), 'Data Definitions')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(valid), 'Valid Values')
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
}

const buf = makeTemplate()
const parsed = parseAmazonTemplate(buf)
const byLabel = (label, occurrence = 0) =>
  parsed.fields.find((f) => f.label === label && f.occurrence === occurrence)

// ── Template parsing ────────────────────────────────────────────────────────

test('reads every column and forward-fills the sparse group row', () => {
  assert.equal(parsed.fields.length, 11)
  assert.equal(byLabel('SKU').group, 'Listing Identity')
  assert.equal(byLabel('Item Name').group, 'Product Identity')
  // Groups are only marked where they start; columns after inherit them.
  assert.equal(byLabel('Material').group, 'Product Details')
  assert.equal(byLabel('League Name').group, 'Product Details')
  assert.equal(byLabel('Main Image URL').group, 'Images')
})

test('joins Data Definitions for requirement and description', () => {
  assert.equal(byLabel('SKU').requirement, 'Required')
  assert.equal(byLabel('Material').requirement, 'Optional')
  assert.match(byLabel('SKU').description, /assigned by the contributor/)
})

test('attaches Valid Values, stripping the " - [ PRODUCT_TYPE ]" suffix', () => {
  assert.deepEqual(byLabel('Material').values, ['Plastic', 'Glass', 'Silicone'])
  assert.deepEqual(byLabel('Height Unit').values, ['Inches', 'Centimeters'])
  assert.equal(parsed.productType, 'FOOD_STORAGE_CONTAINER')
})

test('numbers repeated labels so Bullet Point #2 is distinguishable', () => {
  assert.equal(byLabel('Bullet Point', 0).field, 'bullet_point#1.value')
  assert.equal(byLabel('Bullet Point', 1).field, 'bullet_point#2.value')
  assert.equal(byLabel('Bullet Point', 1).col, 4)
})

// ── Fill policy ─────────────────────────────────────────────────────────────

test('buckets each field to the right source', () => {
  assert.equal(bucketOf(byLabel('Product Type')), 'constant')
  assert.equal(bucketOf(byLabel('SKU')), 'direct')
  assert.equal(bucketOf(byLabel('Bullet Point', 1)), 'direct')
  assert.equal(bucketOf(byLabel('Height Unit')), 'direct')
  assert.equal(bucketOf(byLabel('Material')), 'generate')
  // Images come from the image automation; sports leagues never apply here.
  assert.equal(bucketOf(byLabel('Main Image URL')), 'skip')
  assert.equal(bucketOf(byLabel('League Name')), 'skip')
})

test('direct values follow the occurrence, and units snap onto the enum', () => {
  const src = {
    sku: 'PLS-001', title: 'Lunch box', description: 'd',
    bullets: ['first', 'second'], keywords: [], upc: '',
    lengthCm: '20', widthCm: '10', heightCm: '8', weightKg: '0.3',
  }
  assert.equal(directValue(byLabel('Bullet Point', 0), src), 'first')
  assert.equal(directValue(byLabel('Bullet Point', 1), src), 'second')
  assert.equal(directValue(byLabel('Height base to top'), src), '8')
  // "Centimeters" is picked out of the template's own list, not hardcoded.
  assert.equal(directValue(byLabel('Height Unit'), src), 'Centimeters')
})

test('collapses repeated labels into one question with N slots', () => {
  const asks = generateAsks(parsed.fields)
  assert.deepEqual(asks.map((a) => a.label), ['Material'])
  assert.equal(asks[0].slots.length, 2)
})

// ── Writing back into the template ──────────────────────────────────────────

test('writes data from row 7 and leaves Amazon\'s header block intact', () => {
  const { buf: out } = writeIntoTemplate(buf, 'Template', 7, [
    ['PLS-001', 'FOOD_STORAGE_CONTAINER'],
    ['PLS-002', 'FOOD_STORAGE_CONTAINER'],
  ])
  const wb = XLSX.read(out, { type: 'buffer' })
  const ws = wb.Sheets.Template
  assert.equal(wb.SheetNames.length, 3)
  // Row 1 is the encoded feed settings — losing it means Amazon rejects the file.
  assert.match(String(ws.A1.v), /^settings=feedType=256/)
  assert.equal(ws.A5.v, 'contribution_sku#1.value') // field-name row untouched
  assert.equal(ws.A6.v, 'ABC123') // example row untouched
  assert.equal(ws.A7.v, 'PLS-001')
  assert.equal(ws.A8.v, 'PLS-002')
})

// ── Guardrails ──────────────────────────────────────────────────────────────

test('drops an off-list value the schema should have prevented', () => {
  const values = ['Plastic', 'Glass']
  assert.equal(validateEnum('Plastic', values), 'Plastic')
  assert.equal(validateEnum('plastic', values), 'Plastic') // case-insensitive
  assert.equal(validateEnum('BPA-free plastic', values), '')
  assert.equal(validateEnum('anything', undefined), 'anything') // free-text field
})

test('truncates a long title at a word boundary, never mid-word', () => {
  const long = 'Plastema '.repeat(40).trim() // 359 chars
  const cut = truncateAt(long, LIMITS.title)
  assert.ok(cut.length <= LIMITS.title)
  assert.ok(!cut.endsWith('Plastem'))
  assert.equal(cut, cut.trim())
  assert.equal(truncateAt('short', LIMITS.title), 'short')
})

test('keywords are bounded in bytes, not characters', () => {
  assert.ok(new TextEncoder().encode(truncateBytes('صندوق طعام '.repeat(10), 50)).length <= 50)
  assert.equal(truncateBytes('lunch box', 50), 'lunch box')
})

test('numeric strips units and tolerates comma decimals', () => {
  assert.equal(numeric('12.5 cm'), '12.5')
  assert.equal(numeric('1,6 لتر'), '1.6')
  assert.equal(numeric('no digits'), '')
})

test('flags thin and duplicated titles before anything is spent', () => {
  const reasons = reviewReasons([
    'لانش بوكس جو باك 1.6 لتر مقسم من الداخل',
    'بلاستيما سناك بوكس',
    'بلاستيما سناك بوكس',
    '',
  ])
  assert.equal(reasons[0], '') // 8 tokens, unique
  assert.match(reasons[1], /too thin/)
  assert.match(reasons[1], /duplicated/) // the real PLS-008..011 case
  assert.equal(reasons[1], reasons[2])
  assert.match(reasons[3], /missing title/)
})

test('addReason appends without duplicating', () => {
  assert.equal(addReason('UPC missing', 'UPC missing'), 'UPC missing')
  assert.equal(addReason('UPC missing', 'title too thin'), 'UPC missing; title too thin')
  assert.equal(addReason('', ''), '')
})

// ── Collecting sheet round-trip (the re-upload path) ────────────────────────

test('a collecting sheet survives a write/read round-trip', () => {
  const row = emptyCollectingRow('PLS-001', 'لانش بوكس')
  row.title = 'Plastema Go Pack Lunch Box 1.6L'
  row.description = 'A divided lunch box.'
  row.bullets = ['a', 'b', 'c', 'd', 'e']
  row.keywords = ['k1', 'k2', 'k3', 'k4', 'k5']
  row.lengthCm = '20'
  row.weightKg = '0.34'
  row.estimated = ['width_cm', 'weight_kg']
  row.needsReview = 'UPC missing'

  const back = parseCollectingSheet(buildCollectingSheet([row]))
  assert.equal(back.length, 1)
  assert.equal(back[0].sku, 'PLS-001')
  assert.equal(back[0].title, row.title)
  assert.deepEqual(back[0].bullets, row.bullets)
  assert.deepEqual(back[0].estimated, ['width_cm', 'weight_kg'])
  assert.equal(back[0].needsReview, 'UPC missing')
})

// ── Row assembly: what actually gets uploaded ───────────────────────────────

test('assembles a flat-file row from constants, collecting data and generation', () => {
  const row = emptyCollectingRow('PLS-001', 'لانش بوكس')
  row.title = 'Plastema Go Pack Lunch Box 1.6L'
  row.description = 'A divided lunch box.'
  row.bullets = ['leak resistant', 'divided interior']
  row.heightCm = '8'
  const constants = { productType: 'FOOD_STORAGE_CONTAINER', brand: 'Plastema' }
  const generated = { 'material#1.value': 'Plastic', 'material#2.value': 'Silicone' }

  const cells = buildAmazonRow(parsed, row, constants, generated)

  assert.equal(cells[0], 'PLS-001')                      // direct: SKU
  assert.equal(cells[1], 'FOOD_STORAGE_CONTAINER')       // constant, on the enum
  assert.equal(cells[2], row.title)                      // direct: Item Name
  assert.equal(cells[3], 'leak resistant')               // direct: Bullet Point #1
  assert.equal(cells[4], 'divided interior')             // direct: Bullet Point #2
  assert.equal(cells[5], 'Plastic')                      // generated, slot 1
  assert.equal(cells[6], 'Silicone')                     // generated, slot 2
  assert.equal(cells[7], '8')                            // direct: height
  assert.equal(cells[8], 'Centimeters')                  // unit snapped to the enum
  assert.equal(cells[9], '')                             // League Name skipped
  assert.equal(cells[10], '')                            // image left to the image job
  assert.equal(cells.length, parsed.fields.length)
})

test('a constant that is not on the template list is dropped, not shipped', () => {
  const cells = buildAmazonRow(parsed, emptyCollectingRow('S1', 't'), { productType: 'MADE_UP' }, {})
  assert.equal(cells[1], '')
})
