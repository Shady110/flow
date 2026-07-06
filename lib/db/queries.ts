import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Client, Task, Profile } from '@/lib/types'

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

/** All tasks (optionally scoped to a client). */
export async function getTasks(clientId?: string): Promise<Task[]> {
  const supabase = await createClient()
  let q = supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false })
  if (clientId) q = q.eq('client_id', clientId)
  const { data } = await q
  return (data as Task[]) ?? []
}

/** Internal team profiles (for assignment + analytics), with role name. */
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
