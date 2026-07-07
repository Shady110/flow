import 'server-only'
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

/** Build an .xlsx buffer from an ordered set of columns and output rows. */
export function buildWorkbook(headers: string[], rows: Record<string, string>[]): Buffer {
  const data = rows.map((r) =>
    headers.reduce<Record<string, string>>((o, h) => {
      o[h] = r[h] ?? ''
      return o
    }, {}),
  )
  const ws = XLSX.utils.json_to_sheet(data, { header: headers })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Listings')
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}
