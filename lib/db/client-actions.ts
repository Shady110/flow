'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugRe } from '@/lib/slug'


const clientSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z
    .string()
    .min(2)
    .regex(slugRe, 'Use lowercase letters, numbers and hyphens (subdomain-safe)'),
  status: z.enum(['lead', 'active', 'paused', 'churned']),
  brand_color: z.string().optional(),
  notes: z.string().optional(),
})

export type ActionResult = { ok: true } | { ok: false; error: string }

export async function createClientAction(input: unknown): Promise<ActionResult> {
  const parsed = clientSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('clients').insert({
    ...parsed.data,
    created_by: user?.id ?? null,
  })
  if (error) {
    return {
      ok: false,
      error: error.code === '23505' ? 'That subdomain is already taken.' : error.message,
    }
  }
  revalidatePath('/clients')
  revalidatePath('/')
  return { ok: true }
}

export async function updateClientAction(id: string, input: unknown): Promise<ActionResult> {
  const parsed = clientSchema.partial().safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.from('clients').update(parsed.data).eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/clients/${id}`)
  revalidatePath('/clients')
  return { ok: true }
}

/**
 * Delete a client. Tasks, products, conversations and invoices cascade with it,
 * so this is the one delete worth a loud confirmation in the UI. Any auth users
 * behind their portal logins are removed too — the client_users rows cascade,
 * which would otherwise leave orphaned accounts able to sign in.
 */
export async function deleteClientAction(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: portalUsers } = await supabase
    .from('client_users')
    .select('user_id')
    .eq('client_id', id)

  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  const authIds = (portalUsers ?? []).map((u) => u.user_id).filter(Boolean) as string[]
  if (authIds.length > 0) {
    const admin = createAdminClient()
    // Best-effort: the client row is already gone either way.
    await Promise.all(authIds.map((uid) => admin.auth.admin.deleteUser(uid)))
  }

  revalidatePath('/clients')
  revalidatePath('/')
  return { ok: true }
}
