import 'server-only'

/**
 * Used only when the rate API is unreachable. It will drift — if that turns out
 * to happen often, fall back to the most recent ai_usage.fx_rate instead.
 */
export const FALLBACK_USD_EGP = 48.5

const RATE_URL = 'https://open.er-api.com/v6/latest/USD'

/**
 * USD -> EGP. Free endpoint, no API key. Next's fetch cache keeps this to one
 * request per 6 hours rather than one per generated image.
 *
 * Never throws: a job must not die because an exchange-rate lookup did.
 */
export async function usdToEgp(): Promise<number> {
  try {
    const res = await fetch(RATE_URL, { next: { revalidate: 21_600 } })
    if (!res.ok) return FALLBACK_USD_EGP
    const body = (await res.json()) as { rates?: Record<string, number> }
    const rate = body.rates?.EGP
    return typeof rate === 'number' && Number.isFinite(rate) && rate > 0 ? rate : FALLBACK_USD_EGP
  } catch {
    return FALLBACK_USD_EGP
  }
}
