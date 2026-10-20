import { DEFAULT_CURRENCY } from '@/lib/constants'
import type { InvoiceItem } from '@/lib/types'

/** Format an amount as currency (defaults to EGP). */
export function formatMoney(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  maximumFractionDigits = 2,
  /** Interface language; Arabic keeps Latin digits so amounts match invoice numbers. */
  locale: string = 'en',
): string {
  try {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-EG', {
      style: 'currency',
      currency,
      maximumFractionDigits,
    }).format(amount ?? 0)
  } catch {
    return `${currency} ${(amount ?? 0).toFixed(maximumFractionDigits)}`
  }
}

/**
 * AI spend runs to fractions of a cent — a small listing job costs $0.0008 and
 * would round to "$0.00" at the usual 2 decimals. Widen precision below a cent.
 */
export function formatCost(amount: number, currency = 'USD'): string {
  const n = amount ?? 0
  return formatMoney(n, currency, n !== 0 && Math.abs(n) < 0.01 ? 4 : 2)
}

/** Sum of an invoice's line items. */
export function invoiceTotal(items: Pick<InvoiceItem, 'quantity' | 'unit_price'>[]): number {
  return items.reduce((sum, it) => sum + Number(it.quantity) * Number(it.unit_price), 0)
}
