import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Contract, ContractTemplate } from '@/lib/types'

export async function getContractTemplates(): Promise<ContractTemplate[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('contract_templates').select('*').order('created_at')
  return (data as ContractTemplate[]) ?? []
}

export async function getContracts(clientId?: string): Promise<Contract[]> {
  const supabase = await createClient()
  let q = supabase.from('contracts').select('*').order('created_at', { ascending: false })
  if (clientId) q = q.eq('client_id', clientId)
  const { data } = await q
  return (data as Contract[]) ?? []
}

export async function getContract(id: string): Promise<Contract | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('contracts').select('*').eq('id', id).maybeSingle()
  return (data as Contract) ?? null
}
