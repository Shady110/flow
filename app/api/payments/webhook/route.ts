import { NextResponse } from 'next/server'
import { verifyWebhook } from '@/lib/payments/kashier-sign'
import { parseWebhook } from '@/lib/payments/kashier'
import { webhookKey } from '@/lib/payments/provider'
import { finalizeCheckout } from '@/lib/payments/finalize'

export const runtime = 'nodejs'

/**
 * The gateway tells us what happened to a payment. Trust nothing until the
 * signature checks out; then hand the result to the one idempotent finalizer.
 * Replies: 200 received, 409 already processed (both stop retries), 401 bad signature.
 */
export async function POST(req: Request) {
  let body: { event?: string; data?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 })
  }
  const data = body.data
  if (!data || !verifyWebhook(data, req.headers.get('x-kashier-signature'), webhookKey())) {
    return NextResponse.json({ error: 'bad signature' }, { status: 401 })
  }

  const { merchantOrderId, result } = parseWebhook(body)
  if (!merchantOrderId) return NextResponse.json({ ok: true, ignored: 'no order' })

  try {
    const done = await finalizeCheckout(merchantOrderId, result)
    if (done.outcome === 'already') return NextResponse.json({ ok: true, outcome: done.outcome }, { status: 409 })
    return NextResponse.json({ ok: true, outcome: done.outcome })
  } catch (e) {
    console.error('[payments] webhook failed', e)
    // 500 makes the gateway retry later, which is what we want for a transient error.
    return NextResponse.json({ error: 'could not process' }, { status: 500 })
  }
}
