/**
 * Subdomain slugs for client tenants. Lives outside the `'use server'` action
 * modules because those may only export async functions.
 */
export const slugRe = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/

export function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
}
