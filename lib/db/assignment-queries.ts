import 'server-only'
import { createClient } from '@/lib/supabase/server'

export interface ClientAssignment {
  client_id: string
  profile_id: string
}

/** Who is assigned to which client (RLS: any staff member can read; only account directors write). */
export async function getAssignments(): Promise<ClientAssignment[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('client_assignments').select('client_id, profile_id')
  return (data as ClientAssignment[]) ?? []
}

/** Names of the people assigned to each client, for display. */
export function assigneeNames(assignments: ClientAssignment[], names: Map<string, string>): Map<string, string[]> {
  const out = new Map<string, string[]>()
  for (const a of assignments) {
    const list = out.get(a.client_id) ?? []
    list.push(names.get(a.profile_id) ?? '—')
    out.set(a.client_id, list)
  }
  return out
}
