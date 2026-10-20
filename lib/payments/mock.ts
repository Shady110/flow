import 'server-only'
import type { ChargeInput, CheckoutInput, CheckoutResult, PaymentProvider, PaymentResult } from './types'

// A fake gateway for development: no account, no network. Its "checkout page" is
// served by app/api/payments/mock/checkout (non-production only), which records
// the outcome here and posts a signed webhook, exactly as Kashier would.

type Outcome = PaymentResult & { merchantOrderId: string }
const g = globalThis as unknown as { __mockPayments?: Map<string, Outcome> }
const store = () => (g.__mockPayments ??= new Map())

export function recordMockOutcome(o: Outcome) {
  store().set(o.merchantOrderId, o)
}

let counter = 0

export const mock: PaymentProvider = {
  name: 'mock',

  async createCheckout(i: CheckoutInput): Promise<CheckoutResult> {
    // The fake checkout page is served by our own app, on the webhook's host.
    const origin = new URL(i.webhookUrl).origin
    const q = new URLSearchParams({
      o: i.merchantOrderId,
      a: String(i.amount),
      c: i.currency,
      r: i.redirectUrl,
      w: i.webhookUrl,
      s: i.saveCard ? '1' : '0',
      u: i.customerReference,
    })
    return { sessionId: `mock-${i.merchantOrderId}`, url: `${origin}/api/payments/mock/checkout?${q}` }
  },

  async getPayment({ merchantOrderId }): Promise<PaymentResult> {
    return store().get(merchantOrderId) ?? { status: 'pending', transactionId: null, amount: null, currency: null }
  },

  async payWithToken(i: ChargeInput): Promise<PaymentResult> {
    if (process.env.MOCK_FAIL_CHARGES === '1') {
      return { status: 'failed', transactionId: null, amount: i.amount, currency: i.currency, failureReason: 'Mock: card declined' }
    }
    return { status: 'success', transactionId: `MOCK-CHARGE-${Date.now()}-${++counter}`, amount: i.amount, currency: i.currency }
  },

  async deleteToken(): Promise<void> {},
}
