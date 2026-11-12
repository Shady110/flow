'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { setBanned } from '@/lib/auth/account'
import { provisionClientUser, clientUserSchema } from '@/lib/db/client-user-provision'
import type { ActionResult } from '@/lib/db/client-actions'

/**
 * Provision a client-portal user: creates the client_users row, an auth account
 * with a one-time password, and links them. Returns the temp password once.
 */
export async function createClientUserAction(
  input: unknown,
): Promise<ActionResult & { tempPassword?: string; signInUrl?: string }> {
  const parsed = clientUserSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  // The client_users row goes through RLS (clients.edit).
  const res = await provisionClientUser(parsed.data, await createClient())
  if (res.ok) revalidatePath(`/clients/${parsed.data.clientId}`)
  return res
}

const updateSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  roleAtCompany: z.string().optional().nullable(),
  status: z.enum(['active', 'disabled']),
})

/** Edit a portal user's details. Email is immutable — it's their login. */
export async function updateClientUserAction(
  id: string,
  clientId: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase
    .from('client_users')
    .update({
      full_name: parsed.data.fullName,
      role_at_company: parsed.data.roleAtCompany || null,
      status: parsed.data.status,
    })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }

  // Disabled portal users can't sign in at all; re-enabling lets them back in.
  const { data: row } = await supabase.from('client_users').select('user_id').eq('id', id).maybeSingle()
  if (row?.user_id) await setBanned(row.user_id, parsed.data.status === 'disabled')

  revalidatePath(`/clients/${clientId}`)
  return { ok: true }
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
