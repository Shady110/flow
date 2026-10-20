import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { getProvider, recurringEnabled } from '@/lib/payments/provider'
import type { CheckoutSession, ClientBillingPublic } from '@/lib/types'

/** What the portal needs to know: is online payment on, and the client's saved card (never the token). */
export async function getPortalPayments(clientId: string) {
  const online = getProvider() !== null
  const supabase = await createClient()
  const { data } = online
    ? await supabase
        .from('client_billing')
        .select('client_id, auto_renew, provider, card_brand, card_last4, status, failure_count, last_charge_at')
        .eq('client_id', clientId)
        .maybeSingle()
    : { data: null }
  return { online, recurring: recurringEnabled(), billing: (data as ClientBillingPublic | null) ?? null }
}

export type CheckoutRow = CheckoutSession & { invoice_number: string; client_name: string }

/** Staff: the latest online-payment attempts with who and which invoice. */
export async function getRecentCheckouts(limit = 10): Promise<CheckoutRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('checkout_sessions')
    .select('*, invoice:invoices(number), client:clients(name)')
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data ?? []).map((r) => {
    const { invoice, client, ...rest } = r as CheckoutSession & { invoice: { number: string } | { number: string }[] | null; client: { name: string } | { name: string }[] | null }
    const inv = Array.isArray(invoice) ? invoice[0] : invoice
    const cl = Array.isArray(client) ? client[0] : client
    return { ...rest, invoice_number: inv?.number ?? '—', client_name: cl?.name ?? '—' }
  })
}
