'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { getLocale } from 'next-intl/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClientContext } from '@/lib/auth/client-session'
import { requirePermission } from '@/lib/auth/session'
import { invoiceBalance } from '@/lib/db/invoice-sync'
import { addMonths } from '@/lib/billing'
import { dealMonths } from '@/lib/deals'
import { getProvider, recurringEnabled, returnUrl, webhookUrl } from '@/lib/payments/provider'
import { generateDueInvoices, latestAcceptedDeal } from '@/lib/payments/billing-run'
import type { ActionResult } from '@/lib/db/client-actions'

const startSchema = z.object({ invoiceId: z.string().uuid(), saveCard: z.boolean().optional() })

/**
 * The client pressed "Pay now". The amount is the invoice's balance worked out
 * HERE from the database: nothing the browser sends can change what is charged.
 */
export async function startCheckoutAction(input: unknown): Promise<ActionResult & { url?: string }> {
  const parsed = startSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Something went wrong. Please try again.' }
  const ctx = await getClientContext()
  if (!ctx) return { ok: false, error: 'Please sign in again.' }
  const provider = getProvider()
  if (!provider) return { ok: false, error: 'Online payment is not available yet.' }

  const admin = createAdminClient()
  const { data: invoice } = await admin
    .from('invoices')
    .select('id, client_id, number, status, currency')
    .eq('id', parsed.data.invoiceId)
    .maybeSingle()
  if (!invoice || invoice.client_id !== ctx.client.id || invoice.status !== 'sent') {
    return { ok: false, error: 'This invoice can not be paid online.' }
  }
  const balance = await invoiceBalance(admin, invoice.id)
  if (balance <= 0) return { ok: false, error: 'Nothing is left to pay on this invoice.' }

  // Saving the card needs a signed contract to describe the monthly agreement.
  const billable = parsed.data.saveCard && recurringEnabled() ? await latestAcceptedDeal(ctx.client.id) : null
  const merchantOrderId = `FL-${invoice.number}-${randomBytes(3).toString('hex')}`

  const { data: row, error: insertErr } = await admin
    .from('checkout_sessions')
    .insert({
      invoice_id: invoice.id,
      client_id: invoice.client_id,
      provider: provider.name,
      merchant_order_id: merchantOrderId,
      amount: balance,
      currency: invoice.currency,
      save_card: !!billable,
    })
    .select('id')
    .single()
  if (insertErr || !row) return { ok: false, error: 'Could not start the payment. Please try again.' }

  try {
    const months = billable ? dealMonths(billable.deal) : 0
    const checkout = await provider.createCheckout({
      merchantOrderId,
      amount: balance,
      currency: invoice.currency,
      customerReference: ctx.client.id,
      description: `Invoice ${invoice.number}`,
      redirectUrl: returnUrl(merchantOrderId),
      webhookUrl: webhookUrl(),
      locale: (await getLocale()) === 'ar' ? 'ar' : 'en',
      saveCard: !!billable,
      recurring: billable
        ? {
            months,
            expiryDate: addMonths(billable.start, months),
            maxAmount: Math.max(...billable.deal.phases.map((p) => p.monthly)) + (billable.deal.one_time ?? 0),
          }
        : undefined,
    })
    await admin
      .from('checkout_sessions')
      .update({ provider_session_id: checkout.sessionId, session_url: checkout.url })
      .eq('id', row.id)
    return { ok: true, url: checkout.url }
  } catch (e) {
    await admin.from('checkout_sessions').update({ status: 'failed', failure_reason: e instanceof Error ? e.message : 'Provider error' }).eq('id', row.id)
    console.error('[payments] could not create checkout', e)
    return { ok: false, error: 'We could not open the payment page. Please try again in a moment.' }
  }
}

/** Pause or resume automatic monthly payments (the saved card stays). */
export async function setAutoRenewAction(on: boolean): Promise<ActionResult> {
  const ctx = await getClientContext()
  if (!ctx) return { ok: false, error: 'Please sign in again.' }
  const admin = createAdminClient()
  const { data: b } = await admin.from('client_billing').select('status, card_token').eq('client_id', ctx.client.id).maybeSingle()
  if (!b?.card_token) return { ok: false, error: 'No saved card.' }
  if (on && b.status === 'failed') return { ok: false, error: 'The last automatic payment failed. Please pay the invoice once to refresh your card.' }
  await admin.from('client_billing').update({ auto_renew: on }).eq('client_id', ctx.client.id)
  revalidatePath('/invoices')
  return { ok: true }
}

/** Delete the saved card at the gateway and here. */
export async function removeCardAction(): Promise<ActionResult> {
  const ctx = await getClientContext()
  if (!ctx) return { ok: false, error: 'Please sign in again.' }
  const admin = createAdminClient()
  const { data: b } = await admin.from('client_billing').select('card_token').eq('client_id', ctx.client.id).maybeSingle()
  if (b?.card_token) {
    try {
      await getProvider()?.deleteToken(b.card_token)
    } catch (e) {
      // Don't keep a card we were asked to forget just because the gateway call failed.
      console.error('[payments] could not delete the token at the gateway', e)
    }
  }
  await admin
    .from('client_billing')
    .update({ card_token: null, agreement_id: null, card_brand: null, card_last4: null, auto_renew: false, status: 'canceled', failure_count: 0 })
    .eq('client_id', ctx.client.id)
  revalidatePath('/invoices')
  return { ok: true }
}

/** Staff: create this month's invoice for one client right now (normally the daily job does it). */
export async function generateInvoiceNowAction(clientId: string): Promise<ActionResult & { created?: number }> {
  await requirePermission('invoices.issue')
  const res = await generateDueInvoices({ clientId })
  revalidatePath('/finance')
  revalidatePath(`/clients/${clientId}`)
  return { ok: true, created: res.created }
}
