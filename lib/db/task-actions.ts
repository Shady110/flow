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
  parent_task_id: z.string().uuid().optional().nullable(),
  /** Full assignee set — replaces whatever is stored. */
  assignee_ids: z.array(z.string().uuid()).optional(),
  /** Create-only: one subtask per title, inheriting client + priority. */
  subtask_titles: z.array(z.string().min(1)).optional(),
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

/** Replace a task's assignees. Empty array = unassigned. */
async function setAssignees(
  supabase: Awaited<ReturnType<typeof createClient>>,
  taskId: string,
  profileIds: string[],
): Promise<string | null> {
  const { error: delError } = await supabase.from('task_assignees').delete().eq('task_id', taskId)
  if (delError) return delError.message
  if (profileIds.length === 0) return null
  const { error } = await supabase
    .from('task_assignees')
    .insert(profileIds.map((profile_id) => ({ task_id: taskId, profile_id })))
  return error?.message ?? null
}

function revalidateTask(clientId: string | null | undefined, taskId?: string) {
  if (clientId) revalidatePath(`/clients/${clientId}`)
  if (taskId) revalidatePath(`/tasks/${taskId}`)
  revalidatePath('/tasks')
  revalidatePath('/')
}

export async function createTaskAction(input: unknown): Promise<ActionResult> {
  const parsed = taskSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { assignee_ids = [], subtask_titles = [], ...fields } = parsed.data
  const payload = clean({ ...fields, created_by: user?.id ?? null })
  const { data, error } = await supabase.from('tasks').insert(payload).select('id').single()
  if (error) return { ok: false, error: error.message }

  const assignError = await setAssignees(supabase, data.id, assignee_ids)
  if (assignError) return { ok: false, error: assignError }

  if (subtask_titles.length > 0) {
    const { error: subError } = await supabase.from('tasks').insert(
      subtask_titles.map((title) => ({
        client_id: parsed.data.client_id,
        parent_task_id: data.id,
        title,
        priority: parsed.data.priority,
        created_by: user?.id ?? null,
      })),
    )
    if (subError) return { ok: false, error: subError.message }
  }

  await supabase.from('task_activity').insert({
    task_id: data.id,
    actor_id: user?.id ?? null,
    action: 'created',
    detail: { title: parsed.data.title, subtasks: subtask_titles.length },
  })

  revalidateTask(parsed.data.client_id, parsed.data.parent_task_id ?? undefined)
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
    .select('status, client_id, parent_task_id')
    .eq('id', id)
    .maybeSingle()

  // subtask_titles is create-only; strip both virtual fields off the patch.
  const fields = { ...parsed.data }
  const assignee_ids = fields.assignee_ids
  delete fields.assignee_ids
  delete fields.subtask_titles

  const patch: Record<string, unknown> = clean({ ...fields })
  if (parsed.data.status === 'done') patch.completed_at = new Date().toISOString()
  if (parsed.data.status && parsed.data.status !== 'done') patch.completed_at = null

  const { error } = await supabase.from('tasks').update(patch).eq('id', id)
  if (error) return { ok: false, error: error.message }

  if (assignee_ids) {
    const assignError = await setAssignees(supabase, id, assignee_ids)
    if (assignError) return { ok: false, error: assignError }
  }

  if (parsed.data.status && before && parsed.data.status !== before.status) {
    await supabase.from('task_activity').insert({
      task_id: id,
      actor_id: user?.id ?? null,
      action: 'status_changed',
      detail: { from: before.status, to: parsed.data.status },
    })
  }

  revalidateTask(parsed.data.client_id ?? before?.client_id, id)
  // A subtask's status changes its parent's progress bar.
  if (before?.parent_task_id) revalidatePath(`/tasks/${before.parent_task_id}`)
  return { ok: true }
}

export async function deleteTaskAction(id: string, clientId: string): Promise<ActionResult> {
  const supabase = await createClient()
  // Read the parent first — the row is gone once deleted, and its progress
  // bar needs revalidating.
  const { data: before } = await supabase
    .from('tasks')
    .select('parent_task_id')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidateTask(clientId)
  if (before?.parent_task_id) revalidatePath(`/tasks/${before.parent_task_id}`)
  return { ok: true }
}
