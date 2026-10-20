'use server'

import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/session'
import { setBanned } from '@/lib/auth/account'
import { portalOrigin } from '@/lib/tenant'
import type { ActionResult } from '@/lib/db/client-actions'
import type { PermissionKey } from '@/lib/types'

const REVALIDATE = '/settings/roles'

/** Server-side permission check (the database enforces it too; this fails fast with a clear message). */
async function lacks(perm: PermissionKey): Promise<ActionResult | null> {
  const me = await getCurrentUser()
  return me?.permissions.has(perm) ? null : { ok: false, error: 'You do not have permission to do that.' }
}

export async function createRoleAction(input: {
  name: string
  description?: string
}): Promise<ActionResult> {
  const parsed = z
    .object({ name: z.string().min(2), description: z.string().optional() })
    .safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Enter a role name (min 2 chars).' }
  const denied = await lacks('roles.manage')
  if (denied) return denied

  const supabase = await createClient()
  const { error } = await supabase.from('roles').insert({
    name: parsed.data.name.trim().toLowerCase(),
    description: parsed.data.description ?? null,
  })
  if (error) {
    return {
      ok: false,
      error: error.code === '23505' ? 'A role with that name already exists.' : error.message,
    }
  }
  revalidatePath(REVALIDATE)
  return { ok: true }
}

export async function deleteRoleAction(roleId: string): Promise<ActionResult> {
  const denied = await lacks('roles.manage')
  if (denied) return denied
  const supabase = await createClient()
  // Guard: never delete a system role.
  const { data: role } = await supabase.from('roles').select('is_system').eq('id', roleId).maybeSingle()
  if (role?.is_system) return { ok: false, error: 'System roles cannot be deleted.' }

  const { error } = await supabase.from('roles').delete().eq('id', roleId)
  if (error) return { ok: false, error: error.message }
  revalidatePath(REVALIDATE)
  return { ok: true }
}

/** Replace the full permission set for a role. */
export async function setRolePermissionsAction(
  roleId: string,
  keys: PermissionKey[],
): Promise<ActionResult> {
  const denied = await lacks('roles.manage')
  if (denied) return denied
  const supabase = await createClient()
  const { error: delErr } = await supabase.from('role_permissions').delete().eq('role_id', roleId)
  if (delErr) return { ok: false, error: delErr.message }

  if (keys.length) {
    const rows = keys.map((permission_key) => ({ role_id: roleId, permission_key }))
    const { error: insErr } = await supabase.from('role_permissions').insert(rows)
    if (insErr) return { ok: false, error: insErr.message }
  }
  revalidatePath(REVALIDATE)
  return { ok: true }
}

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  status: z.enum(['invited', 'active', 'disabled']),
})

/**
 * Edit a team member: name and status. Disabling is the delete — the session
 * loader already rejects a `disabled` profile, and removing the auth user would
 * orphan everything they created.
 */
export async function updateProfileAction(
  profileId: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const denied = await lacks('users.manage')
  if (denied) return denied

  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update(parsed.data).eq('id', profileId)
  if (error) return { ok: false, error: error.message }
  // Disabled people can't sign in at all; re-enabling lets them back in.
  await setBanned(profileId, parsed.data.status === 'disabled')
  revalidatePath(REVALIDATE)
  revalidatePath('/team')
  return { ok: true }
}

export async function assignRoleAction(profileId: string, roleId: string): Promise<ActionResult> {
  const denied = await lacks('users.manage')
  if (denied) return denied
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ role_id: roleId }).eq('id', profileId)
  if (error) return { ok: false, error: error.message }
  revalidatePath(REVALIDATE)
  return { ok: true }
}

/**
 * Create an admin account. Records an invitation (so handle_new_user assigns the
 * role) and provisions the auth user with a one-time temporary password that the
 * co-founder shares. Returns the temp password once.
 */
export async function createAdminAction(input: {
  email: string
  roleId: string
  fullName?: string
}): Promise<ActionResult & { tempPassword?: string; signInUrl?: string }> {
  const parsed = z
    .object({ email: z.string().email(), roleId: z.string().uuid(), fullName: z.string().optional() })
    .safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Enter a valid email and role.' }
  const denied = await lacks('users.invite')
  if (denied) return denied

  const supabase = await createClient()
  const admin = createAdminClient()

  // 1. Record invitation so the new-user trigger grants the chosen role.
  const token = randomBytes(24).toString('hex')
  const { error: invErr } = await supabase.from('invitations').insert({
    email: parsed.data.email.toLowerCase(),
    role_id: parsed.data.roleId,
    token,
  })
  if (invErr) return { ok: false, error: invErr.message }

  // 2. Provision the auth user with a temporary password.
  const tempPassword = randomBytes(9).toString('base64url')
  const { error: userErr } = await admin.auth.admin.createUser({
    email: parsed.data.email.toLowerCase(),
    password: tempPassword,
    email_confirm: true,
    user_metadata: parsed.data.fullName ? { full_name: parsed.data.fullName } : undefined,
    // Tagged so the proxy knows this is a team login; the one-time password must be replaced at first sign-in.
    app_metadata: { kind: 'staff', must_change_password: true },
  })
  if (userErr) return { ok: false, error: userErr.message }

  revalidatePath(REVALIDATE)
  return { ok: true, tempPassword, signInUrl: portalOrigin('internal', process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000') }
}
