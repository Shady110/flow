import * as XLSX from 'xlsx'

/** Parse the first sheet of an uploaded workbook/CSV into headers + row objects. */
export function parseSheet(buf: Buffer): {
  headers: string[]
  rows: Record<string, string>[]
} {
  const wb = XLSX.read(buf, { type: 'buffer' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  if (!ws) return { headers: [], rows: [] }
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '', raw: false })
  const headerRow = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, blankrows: false })[0]
  const headers = (headerRow as string[] | undefined)?.map(String) ?? (rows[0] ? Object.keys(rows[0]) : [])
  return { headers, rows }
}

/**
 * Write data rows into an Amazon flat file, in place.
 *
 * The template is edited rather than rebuilt: row 1 carries Amazon's encoded
 * feed settings and rows 2-6 the header block it validates against, so anything
 * that regenerates the workbook from scratch produces a file Seller Central
 * rejects. `bookVBA` keeps the macros a .xlsm ships with.
 */
export function writeIntoTemplate(
  templateBuf: Buffer,
  sheetName: string,
  firstDataRow: number,
  rows: string[][],
): { buf: Buffer; ext: 'xlsm' | 'xlsx' } {
  const wb = XLSX.read(templateBuf, { type: 'buffer', bookVBA: true, cellStyles: true })
  const ws = wb.Sheets[sheetName]
  if (!ws) throw new Error(`The template has no "${sheetName}" sheet any more.`)

  XLSX.utils.sheet_add_aoa(ws, rows, { origin: { r: firstDataRow - 1, c: 0 } })

  const ext = wb.vbaraw ? 'xlsm' : 'xlsx'
  return { buf: XLSX.write(wb, { type: 'buffer', bookType: ext, bookVBA: true }) as Buffer, ext }
}
