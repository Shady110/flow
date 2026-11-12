// Kashier's two signatures, as their docs describe them. Pure (node:crypto only)
// so they are unit-tested with plain node. Keep every Kashier-specific hashing
// rule in this file: if a rule turns out different in test mode, it changes here.
import { createHmac, timingSafeEqual } from 'node:crypto'

const hmacHex = (message: string, key: string) => createHmac('sha256', key).update(message, 'utf8').digest('hex')

/**
 * The "order hash": HMAC-SHA256 (lowercase hex) of
 *   /?payment={merchantId}.{orderReference}.{amount}.{currency}[.{customerReference}]
 * keyed with the Payment API key. The customer reference is appended whenever a
 * card is being saved or charged by token.
 */
export function orderHash(
  p: { mid: string; reference: string; amount: string | number; currency: string; customerReference?: string },
  apiKey: string,
): string {
  const base = `/?payment=${p.mid}.${p.reference}.${p.amount}.${p.currency}`
  return hmacHex(p.customerReference ? `${base}.${p.customerReference}` : base, apiKey)
}

/**
 * The string a webhook signs: the keys named in `data.signatureKeys`, sorted
 * alphabetically, as key=value pairs joined by "&", values URL-encoded.
 */
export function webhookSigningString(data: Record<string, unknown>): string {
  const keys = Array.isArray(data.signatureKeys) ? [...(data.signatureKeys as string[])].sort() : []
  return keys.map((k) => `${k}=${encodeURIComponent(String(data[k] ?? ''))}`).join('&')
}

export function webhookSignature(data: Record<string, unknown>, apiKey: string): string {
  return hmacHex(webhookSigningString(data), apiKey)
}

/** True only when the header matches (hex, case-insensitive, constant-time). */
export function verifyWebhook(data: Record<string, unknown>, header: string | null | undefined, apiKey: string): boolean {
  if (!header || !Array.isArray(data.signatureKeys) || data.signatureKeys.length === 0) return false
  const expected = Buffer.from(webhookSignature(data, apiKey), 'utf8')
  const given = Buffer.from(header.trim().toLowerCase(), 'utf8')
  return expected.length === given.length && timingSafeEqual(expected, given)
}
