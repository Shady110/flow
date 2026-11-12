import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { getClients } from '@/lib/db/queries'
import { getPlatforms } from '@/lib/db/flow-queries'
import { getContractTemplates } from '@/lib/db/contract-queries'
import { parseDeal } from '@/lib/deals'
import type { ComposerClient } from '@/components/contracts/ContractComposer'

/** Everything the composer needs: clients with their platforms, contact and saved deal. */
export async function getComposerData() {
  const supabase = await createClient()
  const [clients, platforms, templates, { data: users }] = await Promise.all([
    getClients(),
    getPlatforms(),
    getContractTemplates(),
    supabase.from('client_users').select('client_id, full_name').order('created_at'),
  ])
  const composerClients: ComposerClient[] = clients.map((c) => ({
    id: c.id,
    name: c.name,
    contactName: users?.find((u) => u.client_id === c.id)?.full_name ?? '',
    platforms: platforms.filter((p) => p.client_id === c.id).map((p) => p.platform),
    deal: parseDeal(c.deal),
  }))
  return { clients: composerClients, templates }
}
