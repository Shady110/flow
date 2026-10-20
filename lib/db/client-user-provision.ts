import 'server-only'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/lib/db/client-actions'

export const clientUserSchema = z.object({
  clientId: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().min(2, 'Name is required'),
  roleAtCompany: z.string().optional(),
})

/**
 * Create the client_users row + auth account + link. `db` decides who is allowed
 * to write the row: the signed-in user's client (RLS applies) or the admin client
 * (the caller has already checked a permission, e.g. lead conversion).
 */
export async function provisionClientUser(
  input: z.infer<typeof clientUserSchema>,
  db: SupabaseClient,
): Promise<ActionResult & { tempPassword?: string }> {
  const { clientId, email, fullName, roleAtCompany } = input

  // 1. Create the client_users row.
  const { data: row, error: rowErr } = await db
    .from('client_users')
    .insert({
      client_id: clientId,
      email: email.toLowerCase(),
      full_name: fullName,
      role_at_company: roleAtCompany ?? null,
      locale: 'ar', // portal users start in Arabic; they can switch any time
    })
    .select('id')
    .single()
  if (rowErr) {
    return {
      ok: false,
      error: rowErr.code === '23505' ? 'That email already exists for this client.' : rowErr.message,
    }
  }

  // 2. Create the auth account with a one-time password.
  const admin = createAdminClient()
  const tempPassword = randomBytes(9).toString('base64url')
  const { data: created, error: userErr } = await admin.auth.admin.createUser({
    email: email.toLowerCase(),
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName, client_user: true },
  })
  if (userErr || !created.user) {
    // Roll back the orphaned client_users row.
    await db.from('client_users').delete().eq('id', row.id)
    return { ok: false, error: userErr?.message ?? 'Could not create the account.' }
  }

  // 3. Link the auth user to the client_users row.
  const { error: linkErr } = await db
    .from('client_users')
    .update({ user_id: created.user.id })
    .eq('id', row.id)
  if (linkErr) return { ok: false, error: linkErr.message }

  return { ok: true, tempPassword }
}

