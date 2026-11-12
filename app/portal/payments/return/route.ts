import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClientContext } from '@/lib/auth/client-session'
import { finalizeCheckout } from '@/lib/payments/finalize'
import { getProvider } from '@/lib/payments/provider'
import type { CheckoutSession } from '@/lib/types'

export const runtime = 'nodejs'

/**
 * Where the client's browser lands after the gateway's page. The URL proves
 * nothing, so we ask the gateway directly what happened, record it through the
 * same finalizer as the webhook, and send the client to their payments with a
 * plain result. This also makes local testing work without a public webhook.
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const ctx = await getClientContext()
  if (!ctx) return NextResponse.redirect(new URL('/login', url))

  const order = url.searchParams.get('o') ?? ''
  const admin = createAdminClient()
  const { data } = await admin.from('checkout_sessions').select('*').eq('merchant_order_id', order).maybeSingle()
  const session = data as CheckoutSession | null
  const to = (pay: 'ok' | 'failed' | 'pending') => NextResponse.redirect(new URL(`/invoices?pay=${pay}`, url))
  if (!session || session.client_id !== ctx.client.id) return to('failed')

  if (session.status !== 'paid') {
    const provider = getProvider()
    if (!provider) return to('pending')
    try {
      const result = await provider.getPayment({ sessionId: session.provider_session_id, merchantOrderId: session.merchant_order_id })
      const done = await finalizeCheckout(session.merchant_order_id, result)
      if (done.outcome === 'paid' || done.outcome === 'already') return to('ok')
      return to(done.outcome === 'pending' ? 'pending' : 'failed')
    } catch (e) {
      console.error('[payments] return verification failed', e)
      return to('pending')
    }
  }
  return to('ok')
}
