import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { UNASSIGNED_OWNER } from '@/lib/constants'
import type { Lead, LeadStatus } from '@/lib/types'

export interface LeadFilters {
  ownerId?: string
  status?: LeadStatus
  /** Matches name, company or email. */
  q?: string
}

/** All leads, newest first, optionally filtered. */
export async function getLeads(filters: LeadFilters = {}): Promise<Lead[]> {
  const supabase = await createClient()
  let query = supabase.from('leads').select('*').order('created_at', { ascending: false })

  if (filters.ownerId === UNASSIGNED_OWNER) query = query.is('owner_id', null)
  else if (filters.ownerId) query = query.eq('owner_id', filters.ownerId)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.q) {
    const term = `%${filters.q.replace(/[%,()]/g, '')}%`
    query = query.or(`name.ilike.${term},company.ilike.${term},email.ilike.${term}`)
  }

  const { data } = await query
  return (data as Lead[]) ?? []
}

export async function getLead(id: string): Promise<Lead | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('leads').select('*').eq('id', id).maybeSingle()
  return (data as Lead) ?? null
}
