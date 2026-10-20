import 'server-only'
import { orderHash } from './kashier-sign'
import type { ChargeInput, CheckoutInput, CheckoutResult, PaymentProvider, PaymentResult } from './types'

// Every Kashier-specific call lives here. Fields marked UNVERIFIED follow the
// public docs but could not be tried against a real account yet (none exists):
// confirm them in test mode before switching to live. Anything else in the app
// talks to the PaymentProvider interface, not to this file.

function config() {
  const mode = process.env.KASHIER_MODE === 'live' ? 'live' : 'test'
  const mid = process.env.KASHIER_MERCHANT_ID
  const apiKey = process.env.KASHIER_API_KEY // the Payment API key (also the webhook key)
  const secret = process.env.KASHIER_SECRET_KEY
  if (!mid || !apiKey || !secret) throw new Error('Kashier is not configured (merchant id, API key, secret key).')
  return {
    mid,
    apiKey,
    secret,
    api: mode === 'live' ? 'https://api.kashier.io' : 'https://test-api.kashier.io',
    fep: mode === 'live' ? 'https://fep.kashier.io' : 'https://test-fep.kashier.io',
  }
}

const money = (n: number) => n.toFixed(2)

async function call(url: string, init: RequestInit): Promise<Record<string, unknown>> {
  const res = await fetch(url, { ...init, cache: 'no-store' })
  const text = await res.text()
  let body: Record<string, unknown> = {}
  try {
    body = JSON.parse(text)
  } catch {
    /* non-JSON error page */
  }
  if (!res.ok) {
    const msg = (body.message as string) || (body.error as string) || text.slice(0, 200) || res.statusText
    throw new Error(`Kashier ${res.status}: ${msg}`)
  }
  return body
}

/** Kashier sometimes nests the payload under `response` or `data`; read either. */
const pick = (body: Record<string, unknown>, key: string): unknown => {
  for (const scope of [body, body.response, body.data] as (Record<string, unknown> | undefined)[]) {
    if (scope && typeof scope === 'object' && key in scope) return scope[key]
  }
  return undefined
}

function toResult(body: Record<string, unknown>): PaymentResult {
  const raw = String(pick(body, 'status') ?? '').toUpperCase()
  const status: PaymentResult['status'] = ['SUCCESS', 'PAID', 'APPROVED', 'CAPTURED'].includes(raw)
    ? 'success'
    : ['FAILURE', 'FAILED', 'DECLINED', 'ERROR', 'EXPIRED'].includes(raw)
      ? 'failed'
      : 'pending'
  const amount = pick(body, 'amount')
  return {
    status,
    transactionId: (pick(body, 'transactionId') as string | undefined) ?? null,
    amount: amount === undefined ? null : Number(amount),
    currency: (pick(body, 'currency') as string | undefined) ?? null,
    failureReason: status === 'failed' ? String(pick(body, 'message') ?? raw) : undefined,
  }
}

export const kashier: PaymentProvider = {
  name: 'kashier',

  async createCheckout(i: CheckoutInput): Promise<CheckoutResult> {
    const c = config()
    const body: Record<string, unknown> = {
      merchantId: c.mid,
      // The docs show `order` on the sessions page and `merchantOrderId` on the
      // recurring page: send both. UNVERIFIED which one a real account wants.
      order: i.merchantOrderId,
      merchantOrderId: i.merchantOrderId,
      amount: money(i.amount),
      currency: i.currency,
      description: i.description,
      customer: { reference: i.customerReference },
      merchantRedirect: i.redirectUrl,
      serverWebhook: i.webhookUrl,
      display: i.locale,
      type: 'one-time',
      expireAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    }
    if (i.saveCard && i.recurring) {
      body.saveCard = 'forced'
      body.interactionSource = 'RECURRING'
      body.agreement = {
        type: 'RECURRING',
        amountVariability: 'VARIABLE',
        paymentFrequency: 'MONTHLY',
        expiryDate: i.recurring.expiryDate,
        numberOfPayments: i.recurring.months,
        maximumAmountPerPayment: i.recurring.maxAmount,
      }
    }
    const res = await call(`${c.api}/v3/payment/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: c.secret, 'api-key': c.apiKey },
      body: JSON.stringify(body),
    })
    const url = pick(res, 'sessionUrl') as string | undefined
    if (!url) throw new Error('Kashier did not return a checkout URL.')
    return { url, sessionId: ((pick(res, 'sessionId') ?? pick(res, '_id') ?? pick(res, 'id')) as string | undefined) ?? null }
  },

  async getPayment({ sessionId }): Promise<PaymentResult> {
    if (!sessionId) return { status: 'pending', transactionId: null, amount: null, currency: null }
    const c = config()
    const res = await call(`${c.api}/v3/payment/sessions/${encodeURIComponent(sessionId)}/payment`, {
      headers: { authorization: c.secret },
    })
    return toResult(res)
  },

  async payWithToken(i: ChargeInput): Promise<PaymentResult> {
    const c = config()
    // UNVERIFIED: the hash string for /v3/orders follows the order-hash rule with
    // the customer reference appended; the docs do not spell it out for this endpoint.
    const hash = orderHash(
      { mid: c.mid, reference: i.merchantOrderId, amount: money(i.amount), currency: i.currency, customerReference: i.customerReference },
      c.apiKey,
    )
    const res = await call(`${c.fep}/v3/orders/`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json', 'Kashier-Hash': hash },
      body: JSON.stringify({
        apiOperation: 'PAY',
        merchantId: c.mid,
        paymentMethod: {
          type: 'CARD',
          card: { cardToken: i.token, ...(i.agreementId ? { agreement: { id: i.agreementId } } : {}), enable3DS: false },
        },
        order: { reference: i.merchantOrderId, amount: money(i.amount), currency: i.currency },
        customer: { reference: i.customerReference },
        interactionSource: 'RECURRING',
        reconciliation: { webhookUrl: i.webhookUrl },
      }),
    })
    return toResult(res)
  },

  async deleteToken(token: string): Promise<void> {
    const c = config()
    await call(`${c.api}/v3/payment/tokenization/tokens/${encodeURIComponent(token)}`, {
      method: 'DELETE',
      headers: { authorization: c.secret },
    })
  },
}

/**
 * Turn a webhook body into our PaymentResult. UNVERIFIED: the saved-card field
 * names (cardToken / cardDataToken, agreementId) come from the recurring guide;
 * the payload page does not show them.
 */
export function parseWebhook(body: { event?: string; data?: Record<string, unknown> }): {
  merchantOrderId: string | null
  result: PaymentResult
} {
  const d = body.data ?? {}
  const raw = String(d.status ?? '').toUpperCase()
  const status: PaymentResult['status'] = raw === 'SUCCESS' ? 'success' : raw === 'FAILURE' ? 'failed' : 'pending'
  const token = (d.cardDataToken ?? d.cardToken ?? d.token) as string | undefined
  const masked = ((d.card as { cardInfo?: { maskedCard?: string; cardBrand?: string } } | undefined)?.cardInfo) ?? {}
  return {
    merchantOrderId: (d.merchantOrderId as string | undefined) ?? null,
    result: {
      status,
      transactionId: (d.transactionId as string | undefined) ?? null,
      amount: d.amount === undefined ? null : Number(d.amount),
      currency: (d.currency as string | undefined) ?? null,
      failureReason: status === 'failed' ? String((d.transactionResponseMessage as { en?: string } | undefined)?.en ?? raw) : undefined,
      card: token
        ? {
            token,
            agreementId: (d.agreementId as string | undefined) ?? null,
            brand: masked.cardBrand ?? null,
            last4: masked.maskedCard ? masked.maskedCard.slice(-4) : null,
          }
        : undefined,
    },
  }
}
