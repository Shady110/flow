'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/db/client-actions'

const taskSchema = z.object({
  client_id: z.string().uuid(),
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'blocked', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  stage: z.string().optional().nullable(),
  next_step: z.string().optional().nullable(),
  assignee_id: z.string().uuid().optional().nullable(),
  start_date: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
})

function clean<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj }
  for (const k of Object.keys(out)) {
    if (out[k] === '' || out[k] === undefined) (out as Record<string, unknown>)[k] = null
  }
  return out
}

export async function createTaskAction(input: unknown): Promise<ActionResult> {
  const parsed = taskSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const payload = clean({ ...parsed.data, created_by: user?.id ?? null })
  const { data, error } = await supabase.from('tasks').insert(payload).select('id').single()
  if (error) return { ok: false, error: error.message }

  await supabase.from('task_activity').insert({
    task_id: data.id,
    actor_id: user?.id ?? null,
    action: 'created',
    detail: { title: parsed.data.title },
  })

  revalidatePath(`/clients/${parsed.data.client_id}`)
  revalidatePath('/tasks')
  revalidatePath('/')
  return { ok: true }
}

export async function updateTaskAction(id: string, input: unknown): Promise<ActionResult> {
  const parsed = taskSchema.partial().safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch prior state to log meaningful status transitions.
  const { data: before } = await supabase
    .from('tasks')
    .select('status, client_id')
    .eq('id', id)
    .maybeSingle()

  const patch: Record<string, unknown> = clean({ ...parsed.data })
  if (parsed.data.status === 'done') patch.completed_at = new Date().toISOString()
  if (parsed.data.status && parsed.data.status !== 'done') patch.completed_at = null

  const { error } = await supabase.from('tasks').update(patch).eq('id', id)
  if (error) return { ok: false, error: error.message }

  if (parsed.data.status && before && parsed.data.status !== before.status) {
    await supabase.from('task_activity').insert({
      task_id: id,
      actor_id: user?.id ?? null,
      action: 'status_changed',
      detail: { from: before.status, to: parsed.data.status },
    })
  }

  const clientId = parsed.data.client_id ?? before?.client_id
  if (clientId) revalidatePath(`/clients/${clientId}`)
  revalidatePath('/tasks')
  revalidatePath('/')
  return { ok: true }
}

export async function deleteTaskAction(id: string, clientId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/clients/${clientId}`)
  revalidatePath('/tasks')
  return { ok: true }
}
