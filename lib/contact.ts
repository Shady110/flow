// Builds a wa.me link from however a person typed their number. Pure + tested.

/**
 * "01012345678", "+20 101 234 5678" and "0020 101…" all become wa.me/201012345678.
 * Egyptian local numbers (leading 0, 11 digits) get the 20 country code.
 * Returns null when there is no usable number.
 */
export function whatsappUrl(raw: string | null | undefined, text?: string): string | null {
  let digits = (raw ?? '').replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  else if (digits.startsWith('0') && digits.length === 11) digits = `20${digits.slice(1)}`
  if (digits.length < 8) return null
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}
