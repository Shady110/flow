import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Client, Task, TaskRow, TaskActivity, Profile, Department } from '@/lib/types'

/** All clients, newest first. */
export async function getClients(): Promise<Client[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  return (data as Client[]) ?? []
}

export async function getClient(id: string): Promise<Client | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('clients').select('*').eq('id', id).maybeSingle()
  return (data as Client) ?? null
}

type JoinedTask = Task & { task_assignees: { profile_id: string }[] | null }

/** Flatten the assignee join and roll subtask progress up onto each parent. */
function toTaskRows(rows: JoinedTask[]): TaskRow[] {
  const total = new Map<string, number>()
  const done = new Map<string, number>()
  for (const t of rows) {
    if (!t.parent_task_id) continue
    total.set(t.parent_task_id, (total.get(t.parent_task_id) ?? 0) + 1)
    if (t.status === 'done') done.set(t.parent_task_id, (done.get(t.parent_task_id) ?? 0) + 1)
  }
  return rows.map(({ task_assignees, ...t }) => ({
    ...t,
    assignee_ids: (task_assignees ?? []).map((a) => a.profile_id),
    subtask_total: total.get(t.id) ?? 0,
    subtask_done: done.get(t.id) ?? 0,
  }))
}

/**
 * All tasks (optionally scoped to a client). `parentOnly` hides subtasks from
 * list views — their progress is rolled up onto the parent instead. Children are
 * always fetched so that roll-up is accurate.
 */
export async function getTasks(
  clientId?: string,
  opts?: { parentOnly?: boolean },
): Promise<TaskRow[]> {
  const supabase = await createClient()
  let q = supabase
    .from('tasks')
    .select('*, task_assignees(profile_id)')
    .order('due_date', { ascending: true, nullsFirst: false })
  if (clientId) q = q.eq('client_id', clientId)
  const { data } = await q
  const rows = toTaskRows((data as JoinedTask[]) ?? [])
  return opts?.parentOnly ? rows.filter((t) => !t.parent_task_id) : rows
}

/** One task with its assignees, subtasks and activity trail. */
export async function getTask(id: string): Promise<
  | (TaskRow & { subtasks: TaskRow[]; activity: TaskActivity[]; parent: Pick<Task, 'id' | 'title'> | null })
  | null
> {
  const supabase = await createClient()
  const [{ data: task }, { data: children }, { data: activity }] = await Promise.all([
    supabase.from('tasks').select('*, task_assignees(profile_id)').eq('id', id).maybeSingle(),
    supabase
      .from('tasks')
      .select('*, task_assignees(profile_id)')
      .eq('parent_task_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('task_activity')
      .select('*')
      .eq('task_id', id)
      .order('created_at', { ascending: false }),
  ])
  if (!task) return null

  const subtasks = toTaskRows((children as JoinedTask[]) ?? [])
  const [row] = toTaskRows([task as JoinedTask])
  const parentId = (task as JoinedTask).parent_task_id
  const { data: parent } = parentId
    ? await supabase.from('tasks').select('id, title').eq('id', parentId).maybeSingle()
    : { data: null }

  return {
    ...row,
    // The joined query can't count its own children, so roll them up here.
    subtask_total: subtasks.length,
    subtask_done: subtasks.filter((s) => s.status === 'done').length,
    subtasks,
    activity: (activity as TaskActivity[]) ?? [],
    parent: (parent as Pick<Task, 'id' | 'title'>) ?? null,
  }
}

/** Internal team profiles (for assignment + analytics), with role name. */
export async function getDepartments(): Promise<Department[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('departments').select('*').order('sort')
  return (data as Department[]) ?? []
}

/** Latest successful sign-in per user (visible to anyone holding users.manage; empty otherwise). */
export async function getLastSignIns(): Promise<Record<string, string>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('auth_events')
    .select('user_id, created_at')
    .eq('event', 'sign_in')
    .order('created_at', { ascending: false })
    .limit(1000)
  const out: Record<string, string> = {}
  for (const r of data ?? []) if (r.user_id && !out[r.user_id]) out[r.user_id] = r.created_at
  return out
}

export async function getTeam(): Promise<(Profile & { role_name: string | null })[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*, roles(name)')
    .order('created_at', { ascending: true })
  return (
    (data as (Profile & { roles: { name: string } | null })[])?.map((p) => ({
      ...p,
      role_name: p.roles?.name ?? null,
    })) ?? []
  )
}
