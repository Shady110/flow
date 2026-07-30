import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Lead } from '@/lib/types'

/** All leads, newest first. */
export async function getLeads(): Promise<Lead[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
  return (data as Lead[]) ?? []
}

export async function getLead(id: string): Promise<Lead | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('leads').select('*').eq('id', id).maybeSingle()
  return (data as Lead) ?? null
}
