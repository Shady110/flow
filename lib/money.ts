import { DEFAULT_CURRENCY } from '@/lib/constants'
import type { InvoiceItem } from '@/lib/types'

/** Format an amount as currency (defaults to EGP). */
export function formatMoney(amount: number, currency: string = DEFAULT_CURRENCY): string {
  try {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount ?? 0)
  } catch {
    return `${currency} ${(amount ?? 0).toFixed(2)}`
  }
}

/** Sum of an invoice's line items. */
export function invoiceTotal(items: Pick<InvoiceItem, 'quantity' | 'unit_price'>[]): number {
  return items.reduce((sum, it) => sum + Number(it.quantity) * Number(it.unit_price), 0)
}
