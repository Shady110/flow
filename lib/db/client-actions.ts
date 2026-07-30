'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

/** Subdomain-safe slug (also reused when converting a lead into a client). */
export const slugRe = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/

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
