'use server'

import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/lib/db/client-actions'

const schema = z.object({
  clientId: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().min(2, 'Name is required'),
  roleAtCompany: z.string().optional(),
})

/**
 * Provision a client-portal user: creates the client_users row, an auth account
 * with a one-time password, and links them. Returns the temp password once.
 */
export async function createClientUserAction(
  input: unknown,
): Promise<ActionResult & { tempPassword?: string }> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const { clientId, email, fullName, roleAtCompany } = parsed.data

  const supabase = await createClient()

  // 1. Create the client_users row (RLS requires clients.edit).
  const { data: row, error: rowErr } = await supabase
    .from('client_users')
    .insert({
      client_id: clientId,
      email: email.toLowerCase(),
      full_name: fullName,
      role_at_company: roleAtCompany ?? null,
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
    await supabase.from('client_users').delete().eq('id', row.id)
    return { ok: false, error: userErr?.message ?? 'Could not create the account.' }
  }

  // 3. Link the auth user to the client_users row.
  const { error: linkErr } = await supabase
    .from('client_users')
    .update({ user_id: created.user.id })
    .eq('id', row.id)
  if (linkErr) return { ok: false, error: linkErr.message }

  revalidatePath(`/clients/${clientId}`)
  return { ok: true, tempPassword }
}

export async function deleteClientUserAction(
  id: string,
  clientId: string,
  authUserId: string | null,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('client_users').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  // Remove the linked auth account too (best-effort).
  if (authUserId) {
    const admin = createAdminClient()
    await admin.auth.admin.deleteUser(authUserId)
  }
  revalidatePath(`/clients/${clientId}`)
  return { ok: true }
}
