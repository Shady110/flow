/**
 * Host / subdomain resolution shared by middleware and server code.
 *
 * Portals:
 *   - marketing : the public apex site (flow.com / www)
 *   - internal  : the FLOW team dashboard (app.flow.com)
 *   - client    : a tenant client portal ({slug}.flow.com)
 */

export type Portal = 'marketing' | 'internal' | 'client'

/** Subdomains that are never client tenants. */
export const RESERVED_SUBDOMAINS = new Set([
  'app',
  'www',
  'api',
  'admin',
  'internal',
  'portal',
  'mail',
  'static',
  'assets',
])

/** The internal-app subdomain. */
export const INTERNAL_SUBDOMAIN = 'app'

/**
 * Extract the leftmost subdomain label from a host header, relative to the
 * configured root domain. Returns null for the apex or `www`.
 *
 * Works for both prod (`acme.flow.com`) and local dev (`acme.localhost:3000`).
 */
export function getSubdomain(host: string | null, rootDomain: string): string | null {
  if (!host) return null
  const h = host.split(':')[0].toLowerCase()
  const root = rootDomain.split(':')[0].toLowerCase()

  if (h === root || h === `www.${root}`) return null
  if (h.endsWith(`.${root}`)) {
    const label = h.slice(0, h.length - root.length - 1)
    // Only the leftmost label counts as the tenant (ignore deeper nesting).
    return label.split('.')[0] || null
  }
  return null
}

/** Map a host to a portal + optional tenant slug. */
export function resolvePortal(
  host: string | null,
  rootDomain: string,
): { portal: Portal; tenant: string | null } {
  const sub = getSubdomain(host, rootDomain)
  if (!sub) return { portal: 'marketing', tenant: null }
  if (sub === INTERNAL_SUBDOMAIN) return { portal: 'internal', tenant: null }
  if (RESERVED_SUBDOMAINS.has(sub)) return { portal: 'marketing', tenant: null }
  return { portal: 'client', tenant: sub }
}
