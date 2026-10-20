import 'server-only'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { syncInvoiceStatus } from '@/lib/db/invoice-sync'
import type { CheckoutSession } from '@/lib/types'
import type { PaymentResult } from './types'

export type FinalizeOutcome = 'paid' | 'already' | 'failed' | 'pending' | 'unknown' | 'rejected'
export interface Finalized {
  outcome: FinalizeOutcome
  invoiceId?: string
  clientId?: string
  reason?: string
}

/**
 * THE place an online payment becomes a payment row. The webhook, the browser
 * return page and the monthly charger all end up here, so it must be safe to run
 * any number of times, in any order, at the same moment:
 *   · a paid session is a no-op ("already");
 *   · the payment insert is guarded by a unique (gateway, gateway_ref), so two
 *     racing calls record ONE payment;
 *   · the amount must equal what we asked for: a mismatch is rejected, not paid.
 * `result` has already been authenticated by the caller (verified webhook
 * signature, or a direct server-to-gateway call) — never pass browser input here.
 */
export async function finalizeCheckout(merchantOrderId: string, result: PaymentResult): Promise<Finalized> {
  const admin = createAdminClient()
  const { data } = await admin.from('checkout_sessions').select('*').eq('merchant_order_id', merchantOrderId).maybeSingle()
  const session = data as CheckoutSession | null
  if (!session) return { outcome: 'unknown' }
  const base = { invoiceId: session.invoice_id, clientId: session.client_id }

  if (session.status === 'paid') return { outcome: 'already', ...base }
  if (result.status === 'pending') return { outcome: 'pending', ...base }

  if (result.status === 'failed') {
    await admin
      .from('checkout_sessions')
      .update({ status: 'failed', failure_reason: result.failureReason ?? 'Payment declined' })
      .eq('id', session.id)
    return { outcome: 'failed', reason: result.failureReason, ...base }
  }

  // success: the gateway must have taken exactly what we asked for, in our currency.
  const wrongAmount = result.amount !== null && Math.abs(result.amount - Number(session.amount)) > 0.009
  const wrongCurrency = result.currency !== null && result.currency !== session.currency
  if (wrongAmount || wrongCurrency) {
    const reason = wrongAmount ? 'Amount mismatch' : 'Currency mismatch'
    await admin.from('checkout_sessions').update({ status: 'failed', failure_reason: reason }).eq('id', session.id)
    return { outcome: 'rejected', reason, ...base }
  }

  const { error } = await admin.from('payments').insert({
    client_id: session.client_id,
    invoice_id: session.invoice_id,
    amount: session.amount,
    method: 'Card',
    gateway: session.provider,
    gateway_ref: result.transactionId ?? merchantOrderId,
    notes: 'Paid online',
  })
  // 23505 = this transaction was already recorded by a racing call: fine.
  if (error && error.code !== '23505') throw new Error(`Could not record the payment: ${error.message}`)

  await admin.from('checkout_sessions').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', session.id)
  await syncInvoiceStatus(admin, session.invoice_id)

  // A saved card (the client ticked "pay automatically"): keep the token for next month.
  if (session.save_card && result.card) {
    await admin.from('client_billing').upsert({
      client_id: session.client_id,
      provider: session.provider,
      card_token: result.card.token,
      agreement_id: result.card.agreementId,
      card_brand: result.card.brand,
      card_last4: result.card.last4,
      auto_renew: true,
      status: 'active',
      failure_count: 0,
    })
  }

  revalidatePath('/finance')
  revalidatePath(`/finance/invoices/${session.invoice_id}`)
  revalidatePath('/invoices')
  revalidatePath(`/clients/${session.client_id}`)
  return { outcome: 'paid', ...base }
}
