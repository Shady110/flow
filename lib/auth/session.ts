import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ALL_PERMISSION_KEYS } from '@/lib/constants'
import type { CurrentUser, PermissionKey } from '@/lib/types'

/**
 * Resolve the current internal user: auth session + profile + role + the
 * fully-expanded permission set. Returns null if not signed in OR the signed-in
 * user has no internal profile (e.g. a client-portal user).
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient()
  // Verified locally (the proxy already refreshed the session), so no extra round trip to Auth.
  const { data: auth } = await supabase.auth.getClaims()
  const claims = auth?.claims as { sub?: string; email?: string } | undefined
  if (!claims?.sub) return null
  const user = { id: claims.sub, email: claims.email }

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      `id, full_name, avatar_url, status,
       profile_roles ( role:roles ( id, name, is_system, department_key, rank ) )`,
    )
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || profile.status === 'disabled') return null

  type RoleRow = {
    id: string
    name: string
    is_system: boolean
    department_key: string | null
    rank: 'director' | 'employee' | null
  }
  // Supabase returns the joined relation as an array or object depending on FK; normalise.
  const roleRows: RoleRow[] = (profile.profile_roles ?? [])
    .map((pr: { role: RoleRow | RoleRow[] | null }) => (Array.isArray(pr.role) ? pr.role[0] : pr.role))
    .filter((r: RoleRow | null | undefined): r is RoleRow => !!r)
  // One-person company: every internal login is the Flow Dashboard owner with every permission.
  const permissions = new Set<PermissionKey>(ALL_PERMISSION_KEYS)
  const roles = roleRows.map((r) => ({ id: r.id, name: r.name, department_key: r.department_key, rank: r.rank }))
  const first = roleRows[0]

  return {
    id: profile.id,
    email: user.email ?? '',
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    status: profile.status,
    role: first ? { id: first.id, name: first.name, is_system: first.is_system } : null,
    roles,
    permissions,
    department_key: null,
    departments: [],
    level: null,
  }
})

/** Require an internal session; redirect to the login page otherwise. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

/** Require a specific permission; redirect to the dashboard home if lacking. */
export async function requirePermission(perm: PermissionKey): Promise<CurrentUser> {
  const user = await requireUser()
  if (!user.permissions.has(perm)) redirect('/')
  return user
}

/** Require at least one of several permissions. */
export async function requireAnyPermission(perms: PermissionKey[]): Promise<CurrentUser> {
  const user = await requireUser()
  if (!perms.some((p) => user.permissions.has(p))) redirect('/')
  return user
}

export function can(user: CurrentUser | null, perm: PermissionKey): boolean {
  return !!user?.permissions.has(perm)
}
