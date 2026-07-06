'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/db/client-actions'

const schema = z.object({
  client_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  sku: z.string().optional().nullable(),
  marketplace: z.string().optional().nullable(),
  status: z.enum(['draft', 'in_progress', 'review', 'live', 'rejected', 'paused']),
  price: z.coerce.number().optional().nullable(),
  image_url: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

function clean<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj }
  for (const k of Object.keys(out)) {
    if (out[k] === '' || out[k] === undefined) (out as Record<string, unknown>)[k] = null
  }
  return out
}

export async function createProductAction(input: unknown): Promise<ActionResult> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('products').insert(clean({ ...parsed.data, updated_by: user?.id ?? null }))
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/clients/${parsed.data.client_id}`)
  return { ok: true }
}

export async function updateProductAction(id: string, input: unknown): Promise<ActionResult> {
  const parsed = schema.partial().safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('products')
    .update(clean({ ...parsed.data, updated_by: user?.id ?? null }))
    .eq('id', id)
  if (error) return { ok: false, error: error.message }
  if (parsed.data.client_id) revalidatePath(`/clients/${parsed.data.client_id}`)
  return { ok: true }
}

export async function deleteProductAction(id: string, clientId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/clients/${clientId}`)
  return { ok: true }
}
