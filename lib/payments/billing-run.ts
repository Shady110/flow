import 'server-only'
import { randomBytes } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { currentCycle, cycleLines } from '@/lib/billing'
import { parseDeal } from '@/lib/deals'
import { invoiceBalance } from '@/lib/db/invoice-sync'
import { finalizeCheckout } from './finalize'
import { getProvider, recurringEnabled, webhookUrl } from './provider'

const today = () => new Date()
const iso = (d: Date) => d.toISOString().slice(0, 10)

/** The client's newest signed contract that states a deal, with its start date. */
export async function latestAcceptedDeal(clientId: string) {
  const { data } = await createAdminClient()
    .from('contracts')
    .select('terms, start_date, accepted_at')
    .eq('client_id', clientId)
    .eq('status', 'accepted')
    .order('accepted_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const deal = data ? parseDeal(data.terms) : null
  const start = data ? (data.start_date ?? data.accepted_at?.slice(0, 10) ?? null) : null
  return deal && start ? { deal, start } : null
}

/**
 * Create this month's invoice for every active client with a signed contract.
 * Safe to run any number of times: invoices carry a unique (client, billing
 * period), so a second run the same month inserts nothing.
 */
export async function generateDueInvoices(opts: { clientId?: string } = {}) {
  const admin = createAdminClient()
  let q = admin
    .from('contracts')
    .select('client_id, terms, start_date, accepted_at, clients!inner(status)')
    .eq('status', 'accepted')
    .eq('clients.status', 'active')
    .order('accepted_at', { ascending: false })
  if (opts.clientId) q = q.eq('client_id', opts.clientId)
  const { data: contracts } = await q

  const seen = new Set<string>()
  let created = 0
  let skipped = 0
  for (const c of (contracts as { client_id: string; terms: unknown; start_date: string | null; accepted_at: string | null }[]) ?? []) {
    if (seen.has(c.client_id)) continue // newest accepted contract wins
    seen.add(c.client_id)
    const deal = parseDeal(c.terms)
    const start = c.start_date ?? c.accepted_at?.slice(0, 10)
    const cycle = deal && start ? currentCycle(start, deal, today()) : null
    if (!cycle) {
      skipped++
      continue
    }

    const { data: invoice, error } = await admin
      .from('invoices')
      .insert({
        client_id: c.client_id,
        status: 'sent',
        currency: 'EGP',
        issue_date: iso(today()),
        due_date: cycle.dueDate,
        billing_period: cycle.period,
        source: 'auto',
        notes: `Automatic monthly invoice, month ${cycle.month} of ${cycle.of}.`,
      })
      .select('id')
      .single()
    // 23505: this month's invoice already exists: exactly what the unique index is for.
    if (error) {
      if (error.code === '23505') skipped++
      else throw new Error(error.message)
      continue
    }
    await admin.from('invoice_items').insert(
      cycleLines(cycle).map((l, position) => ({ invoice_id: invoice.id, position, ...l })),
    )
    created++
  }
  return { created, skipped }
}

/**
 * Charge saved cards for auto invoices that are due (Phase 2). Off unless
 * recurring is enabled. Three failures in a row stop the automatic attempts and
 * leave the invoice as a normal "Due" one the client can pay by hand.
 */
export async function chargeDueInvoices() {
  const provider = getProvider()
  if (!provider || !recurringEnabled()) return { charged: 0, failed: 0, skipped: 0, enabled: false }

  const admin = createAdminClient()
  const { data: cards } = await admin
    .from('client_billing')
    .select('client_id, card_token, agreement_id, failure_count')
    .eq('auto_renew', true)
    .eq('status', 'active')
    .not('card_token', 'is', null)

  let charged = 0
  let failed = 0
  let skipped = 0
  for (const card of (cards as { client_id: string; card_token: string; agreement_id: string | null; failure_count: number }[]) ?? []) {
    const { data: invoices } = await admin
      .from('invoices')
      .select('id, number, currency')
      .eq('client_id', card.client_id)
      .eq('source', 'auto')
      .eq('status', 'sent')
      .lte('due_date', iso(today()))

    for (const inv of (invoices as { id: string; number: string; currency: string }[]) ?? []) {
      const balance = await invoiceBalance(admin, inv.id)
      if (balance <= 0) continue
      // One automatic attempt per invoice per day.
      const since = new Date(Date.now() - 24 * 3600_000).toISOString()
      const { count } = await admin
        .from('checkout_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('invoice_id', inv.id)
        .gte('created_at', since)
      if ((count ?? 0) > 0) {
        skipped++
        continue
      }

      const merchantOrderId = `AUTO-${inv.number}-${randomBytes(3).toString('hex')}`
      await admin.from('checkout_sessions').insert({
        invoice_id: inv.id,
        client_id: card.client_id,
        provider: provider.name,
        merchant_order_id: merchantOrderId,
        amount: balance,
        currency: inv.currency,
        save_card: false,
      })
      let result
      try {
        result = await provider.payWithToken({
          token: card.card_token,
          agreementId: card.agreement_id,
          merchantOrderId,
          amount: balance,
          currency: inv.currency,
          customerReference: card.client_id,
          webhookUrl: webhookUrl(),
        })
      } catch (e) {
        result = { status: 'failed' as const, transactionId: null, amount: null, currency: null, failureReason: e instanceof Error ? e.message : 'Charge failed' }
      }
      const done = await finalizeCheckout(merchantOrderId, result)
      if (done.outcome === 'paid' || done.outcome === 'already') {
        charged++
        await admin.from('client_billing').update({ failure_count: 0, last_charge_at: new Date().toISOString() }).eq('client_id', card.client_id)
      } else if (done.outcome === 'failed' || done.outcome === 'rejected') {
        failed++
        const next = card.failure_count + 1
        await admin
          .from('client_billing')
          .update({ failure_count: next, ...(next >= 3 ? { status: 'failed' } : {}) })
          .eq('client_id', card.client_id)
        card.failure_count = next
      }
    }
  }
  return { charged, failed, skipped, enabled: true }
}
