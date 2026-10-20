/**
 * Host resolution shared by the proxy and server code. Three addresses, none
 * of which carries a client's name:
 *   - marketing : the public site (flow.com / www)
 *   - internal  : the team dashboard (app.flow.com)
 *   - client    : ONE shared client dashboard (portal.flow.com); who you are
 *                 is decided by your sign-in, not by the address
 * Any other label (an old `acme.flow.com` link) is sent to the client address.
 */

export type Portal = 'marketing' | 'internal' | 'client'

/** Subdomains that are never anything else. */
export const RESERVED_SUBDOMAINS = new Set(['app', 'www', 'api', 'admin', 'internal', 'portal', 'mail', 'static', 'assets'])

export const INTERNAL_SUBDOMAIN = 'app'
export const CLIENT_SUBDOMAIN = process.env.NEXT_PUBLIC_CLIENT_SUBDOMAIN || 'portal'

/**
 * Leftmost subdomain label relative to the root domain; null for the apex or
 * `www`. Works for prod (`portal.flow.com`) and dev (`portal.localhost:3000`).
 */
export function getSubdomain(host: string | null, rootDomain: string): string | null {
  if (!host) return null
  const h = host.split(':')[0].toLowerCase()
  const root = rootDomain.split(':')[0].toLowerCase()
  if (h === root || h === `www.${root}`) return null
  if (h.endsWith(`.${root}`)) return h.slice(0, h.length - root.length - 1).split('.')[0] || null
  return null
}

/** Which portal a host belongs to. `legacyClient` = an old per-client address to redirect. */
export function resolvePortal(
  host: string | null,
  rootDomain: string,
  clientSub: string = CLIENT_SUBDOMAIN,
): { portal: Portal; legacyClient: boolean } {
  const sub = getSubdomain(host, rootDomain)
  if (!sub) return { portal: 'marketing', legacyClient: false }
  if (sub === INTERNAL_SUBDOMAIN) return { portal: 'internal', legacyClient: false }
  if (sub === clientSub) return { portal: 'client', legacyClient: false }
  if (RESERVED_SUBDOMAINS.has(sub)) return { portal: 'marketing', legacyClient: false }
  return { portal: 'client', legacyClient: true }
}

/** `https://app.flow.com` / `http://portal.localhost:3000` for a portal. */
export function portalOrigin(portal: 'internal' | 'client', rootDomain: string, clientSub: string = CLIENT_SUBDOMAIN): string {
  const proto = rootDomain.includes('localhost') ? 'http' : 'https'
  return `${proto}://${portal === 'internal' ? INTERNAL_SUBDOMAIN : clientSub}.${rootDomain}`
}
