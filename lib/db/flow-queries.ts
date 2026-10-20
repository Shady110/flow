import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { ClientPlatform, StageEvent } from '@/lib/types'

/** Platform accounts the viewer can see (RLS scopes this by role + stage). */
export async function getPlatforms(clientId?: string): Promise<ClientPlatform[]> {
  const supabase = await createClient()
  let q = supabase.from('client_platforms').select('*').order('created_at')
  if (clientId) q = q.eq('client_id', clientId)
  const { data } = await q
  return (data as ClientPlatform[]) ?? []
}

export async function getStageEvents(clientId: string, limit = 30): Promise<StageEvent[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('stage_events')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data as StageEvent[]) ?? []
}

export async function getMonthlyClientCap(): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'monthly_client_cap')
    .maybeSingle()
  const n = Number(data?.value)
  return Number.isFinite(n) && n >= 0 ? n : 10
}

export interface CompanySettings {
  cap: number
  whatsapp: string
  paymentEn: string
  paymentAr: string
}

/** Everything on the Company settings page (internal users only, via RLS). */
export async function getCompanySettings(): Promise<CompanySettings> {
  const supabase = await createClient()
  const { data } = await supabase.from('app_settings').select('key, value')
  const get = (k: string) => data?.find((r) => r.key === k)?.value
  const pay = (get('payment_instructions') ?? {}) as { en?: string; ar?: string }
  const cap = Number(get('monthly_client_cap'))
  const wa = get('support_whatsapp')
  return {
    cap: Number.isFinite(cap) && cap >= 0 ? cap : 10,
    whatsapp: typeof wa === 'string' ? wa : '',
    paymentEn: pay.en ?? '',
    paymentAr: pay.ar ?? '',
  }
}
