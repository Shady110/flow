import { requireClientContext } from '@/lib/auth/client-session'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'
import { ProductsView } from '@/components/portal/ProductsView'

export default async function PortalProducts() {
  const { client } = await requireClientContext()
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('*').eq('client_id', client.id).order('updated_at', { ascending: false })
  return <ProductsView products={(data as Product[]) ?? []} />
}
