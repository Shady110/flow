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
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      `id, full_name, avatar_url, status,
       role:roles ( id, name, is_system,
         role_permissions ( permission_key ) )`,
    )
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || profile.status === 'disabled') return null

  // Supabase returns the joined relation as an array or object depending on FK;
  // normalise to a single role object.
  const role = Array.isArray(profile.role) ? profile.role[0] : profile.role
  // Co-founders implicitly hold every permission (mirrors the DB has_permission
  // function), so newly-added permissions don't need to be re-granted to them.
  const permissions =
    role?.name === 'co-founder'
      ? new Set<PermissionKey>(ALL_PERMISSION_KEYS)
      : new Set<PermissionKey>(
          (role?.role_permissions ?? []).map(
            (rp: { permission_key: string }) => rp.permission_key as PermissionKey,
          ),
        )

  // Kept separate (and tolerant) so the app keeps working before migration 0021 is applied.
  const { data: org } = await supabase.from('profiles').select('department_key, level').eq('id', user.id).maybeSingle()

  return {
    id: profile.id,
    email: user.email ?? '',
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    status: profile.status,
    role: role ? { id: role.id, name: role.name, is_system: role.is_system } : null,
    permissions,
    department_key: org?.department_key ?? null,
    level: org?.level ?? null,
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

export function can(user: CurrentUser | null, perm: PermissionKey): boolean {
  return !!user?.permissions.has(perm)
}
