import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { invoiceTotal } from '@/lib/money'

/**
 * Re-derive an invoice's paid/sent status from its items and payments. Called
 * after anything that moves the total or the amount received, so a corrected
 * payment can un-pay an invoice as well as pay it. Shared by manual payments
 * (finance actions) and online ones (the payment finalizer).
 */
export async function syncInvoiceStatus(supabase: SupabaseClient, invoiceId: string) {
  const [{ data: invoice }, { data: items }, { data: pays }] = await Promise.all([
    supabase.from('invoices').select('status').eq('id', invoiceId).maybeSingle(),
    supabase.from('invoice_items').select('quantity, unit_price').eq('invoice_id', invoiceId),
    supabase.from('payments').select('amount').eq('invoice_id', invoiceId),
  ])
  // A voided or draft invoice isn't waiting on money; leave it alone.
  if (!invoice || invoice.status === 'void' || invoice.status === 'draft') return

  const total = invoiceTotal((items as { quantity: number; unit_price: number }[]) ?? [])
  const paid = ((pays as { amount: number }[]) ?? []).reduce((s, p) => s + Number(p.amount), 0)
  const next = total > 0 && paid >= total ? 'paid' : 'sent'
  if (next !== invoice.status) {
    await supabase.from('invoices').update({ status: next }).eq('id', invoiceId)
  }
}

/** What is still owed on an invoice (never negative). */
export async function invoiceBalance(supabase: SupabaseClient, invoiceId: string): Promise<number> {
  const [{ data: items }, { data: pays }] = await Promise.all([
    supabase.from('invoice_items').select('quantity, unit_price').eq('invoice_id', invoiceId),
    supabase.from('payments').select('amount').eq('invoice_id', invoiceId),
  ])
  const total = invoiceTotal((items as { quantity: number; unit_price: number }[]) ?? [])
  const paid = ((pays as { amount: number }[]) ?? []).reduce((s, p) => s + Number(p.amount), 0)
  return Math.max(0, Math.round((total - paid) * 100) / 100)
}
