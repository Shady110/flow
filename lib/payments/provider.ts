import 'server-only'
import { kashier } from './kashier'
import { mock } from './mock'
import type { PaymentProvider } from './types'

/** The active provider, or null when online payments are off (the portal then shows How-to-pay only). */
export function getProvider(): PaymentProvider | null {
  switch (process.env.PAYMENTS_PROVIDER) {
    case 'kashier':
      return kashier
    case 'mock':
      // Never let a fake gateway run in production.
      return process.env.NODE_ENV === 'production' ? null : mock
    default:
      return null
  }
}

/** Saved cards + automatic charging are a separate switch, off until test mode proves them. */
export function recurringEnabled(): boolean {
  return getProvider() !== null && process.env.KASHIER_RECURRING_ENABLED === 'true'
}

/** Key that signs/verifies webhooks (Kashier's Payment API key; a fixed dev key for the mock). */
export function webhookKey(): string {
  return process.env.KASHIER_API_KEY || 'mock-dev-key'
}

const protocol = (root: string) => (root.includes('localhost') ? 'http' : 'https')
const root = () => process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000'

/** Public URL the gateway calls with results. */
export const webhookUrl = () => `${protocol(root())}://${root()}/api/payments/webhook`

/** Where the browser lands after paying: the client's own portal address. */
export const returnUrl = (slug: string, merchantOrderId: string) =>
  `${protocol(root())}://${slug}.${root()}/payments/return?o=${encodeURIComponent(merchantOrderId)}`
