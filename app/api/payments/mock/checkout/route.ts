import { NextResponse } from 'next/server'
import { webhookSignature } from '@/lib/payments/kashier-sign'
import { recordMockOutcome } from '@/lib/payments/mock'
import { webhookKey, webhookUrl } from '@/lib/payments/provider'

export const runtime = 'nodejs'

// DEVELOPMENT ONLY: stands in for Kashier's hosted checkout page so the whole
// payment flow can be tried with no account. Disabled in production and unless
// PAYMENTS_PROVIDER=mock.
const enabled = () => process.env.NODE_ENV !== 'production' && process.env.PAYMENTS_PROVIDER === 'mock'

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

export async function GET(req: Request) {
  if (!enabled()) return new NextResponse('Not found', { status: 404 })
  const q = new URL(req.url).searchParams
  const fields = ['o', 'a', 'c', 'r', 'w', 's', 'u'].map((k) => `<input type="hidden" name="${k}" value="${esc(q.get(k) ?? '')}">`).join('')
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mock checkout</title>
<body style="font-family:system-ui;max-width:420px;margin:12vh auto;padding:24px;text-align:center">
<p style="color:#b45309;font-size:13px">MOCK CHECKOUT, development only. No real money moves.</p>
<h1 style="margin:8px 0">${esc(q.get('a') ?? '')} ${esc(q.get('c') ?? '')}</h1>
<p style="color:#555">Order ${esc(q.get('o') ?? '')}${q.get('s') === '1' ? ' · saving the card for monthly payments' : ''}</p>
<form method="post" style="display:grid;gap:12px;margin-top:24px">${fields}
<button name="result" value="pay" style="padding:16px;font-size:18px;border:0;border-radius:12px;background:#0D422C;color:#fff">Pay</button>
<button name="result" value="fail" style="padding:16px;font-size:18px;border:1px solid #ccc;border-radius:12px;background:#fff">Decline</button>
</form></body>`
  return new NextResponse(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
}

export async function POST(req: Request) {
  if (!enabled()) return new NextResponse('Not found', { status: 404 })
  const f = await req.formData()
  const get = (k: string) => String(f.get(k) ?? '')
  const [order, amount, currency, redirect, hook, save] = [get('o'), Number(get('a')), get('c'), get('r'), get('w'), get('s') === '1']
  // Only ever post to OUR webhook, and only ever bounce back to OUR own return address.
  if (hook !== webhookUrl()) return new NextResponse('Bad webhook', { status: 400 })
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000'
  let back: URL
  try {
    back = new URL(redirect)
  } catch {
    return new NextResponse('Bad return url', { status: 400 })
  }
  if (!(back.host === root || back.host.endsWith(`.${root}`))) return new NextResponse('Bad return url', { status: 400 })

  const ok = get('result') === 'pay'
  const transactionId = `MOCK-${Date.now()}`
  const data: Record<string, unknown> = {
    merchantOrderId: order,
    status: ok ? 'SUCCESS' : 'FAILURE',
    amount,
    currency,
    transactionId,
    method: 'card',
    signatureKeys: ['amount', 'currency', 'merchantOrderId', 'status', 'transactionId'],
    ...(ok && save
      ? { cardToken: `mock-token-${order}`, agreementId: `mock-agreement-${order}`, card: { cardInfo: { cardBrand: 'Visa', maskedCard: '411111******4242' } } }
      : {}),
  }
  recordMockOutcome({
    merchantOrderId: order,
    status: ok ? 'success' : 'failed',
    transactionId,
    amount,
    currency,
    card: ok && save ? { token: `mock-token-${order}`, agreementId: `mock-agreement-${order}`, brand: 'Visa', last4: '4242' } : undefined,
  })
  try {
    await fetch(hook, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-kashier-signature': webhookSignature(data, webhookKey()) },
      body: JSON.stringify({ event: 'pay', data }),
    })
  } catch (e) {
    console.error('[mock checkout] webhook post failed', e)
  }
  return NextResponse.redirect(back, 303)
}
