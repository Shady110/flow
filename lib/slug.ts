/**
 * Internal client labels (no longer an address: clients share one sign-in). Lives outside the `'use server'` action
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

/** A unique internal label for a new client: readable name plus a short random suffix. */
export function makeSlug(name: string) {
  const base = slugify(name).replace(/^-+|-+$/g, '').slice(0, 40) || 'client'
  return `${base}-${Math.random().toString(36).slice(2, 6)}`
}
