/**
 * Decides what the proxy does with a request, from facts that are all in the
 * session token (no database): which portal, whether signed in, what kind of
 * account it is, and whether a password change is still owed.
 */

import type { Portal } from '../tenant.ts'

export type AccountKind = 'staff' | 'client'

export type Guard =
  | { type: 'allow' }
  | { type: 'redirect'; to: string }
  | { type: 'wrong-address' }

/** Pages that need no session. */
const PUBLIC = ['/login', '/forgot-password', '/auth/confirm']
/** Signed-in pages that must stay reachable while a password change is owed. */
const CHANGE_EXEMPT = ['/change-password', '/wrong-address']

const is = (path: string, list: string[]) => list.some((p) => path === p || path.startsWith(`${p}/`))

export function guard(input: {
  portal: Exclude<Portal, 'marketing'>
  signedIn: boolean
  /** From app_metadata.kind; undefined for a session issued before kinds existed. */
  kind?: AccountKind
  mustChange?: boolean
  path: string
}): Guard {
  const { portal, signedIn, kind, mustChange, path } = input

  if (!signedIn) return is(path, PUBLIC) ? { type: 'allow' } : { type: 'redirect', to: '/login' }

  // A known account on the wrong address: show the friendly screen, never loop.
  const home: AccountKind = portal === 'internal' ? 'staff' : 'client'
  if (kind && kind !== home) return { type: 'wrong-address' }

  if (mustChange && !is(path, CHANGE_EXEMPT)) return { type: 'redirect', to: '/change-password' }

  // Signed in and correct: skip the sign-in page.
  if (kind === home && path === '/login') return { type: 'redirect', to: '/' }

  return { type: 'allow' }
}
