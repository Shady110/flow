// The shape every payment provider (Kashier, the dev mock) must offer. Keeping it
// this small means the rest of the app never mentions a gateway by name.

export interface CheckoutInput {
  /** OUR unique reference for this attempt; the gateway echoes it back. */
  merchantOrderId: string
  amount: number
  currency: string
  /** Stable id for the paying customer (the client id), needed for saved cards. */
  customerReference: string
  description: string
  /** Where the browser returns after paying. Never trusted: we re-verify server-side. */
  redirectUrl: string
  /** Public URL the gateway posts the result to. */
  webhookUrl: string
  locale: 'en' | 'ar'
  /** Ask the gateway to keep the card for monthly charges. */
  saveCard: boolean
  /** Agreement terms for a saved card (monthly, until the contract ends). */
  recurring?: { months: number; expiryDate: string; maxAmount: number }
}

export interface CheckoutResult {
  sessionId: string | null
  url: string
}

export interface PaymentResult {
  status: 'success' | 'failed' | 'pending'
  transactionId: string | null
  amount: number | null
  currency: string | null
  failureReason?: string
  /** Present on a successful save-card payment. */
  card?: { token: string; agreementId: string | null; brand: string | null; last4: string | null }
}

export interface ChargeInput {
  token: string
  agreementId: string | null
  merchantOrderId: string
  amount: number
  currency: string
  customerReference: string
  webhookUrl: string
}

export interface PaymentProvider {
  name: 'kashier' | 'mock'
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>
  /** Ask the gateway directly what happened (never trust the browser). */
  getPayment(ref: { sessionId: string | null; merchantOrderId: string }): Promise<PaymentResult>
  payWithToken(input: ChargeInput): Promise<PaymentResult>
  deleteToken(token: string): Promise<void>
}
