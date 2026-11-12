import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Client, ClientUser } from '@/lib/types'

export interface ClientContext {
  email: string
  clientUser: ClientUser
  client: Client
}

/**
 * The signed-in client-portal user and their client, found from the login alone
 * (no client name in the address). One joined query; null if not signed in, not a
 * client user, or disabled. Cached for the duration of a request so the layout
 * and the page share one lookup.
 */
export const getClientContext = cache(async (): Promise<ClientContext | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('client_users')
    .select('*, client:clients(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
  if (!data) return null

  const { client, ...clientUser } = data as ClientUser & { client: Client | Client[] | null }
  const c = Array.isArray(client) ? client[0] : client
  if (!c) return null

  return { email: user.email ?? '', clientUser: clientUser as ClientUser, client: c }
})

export async function requireClientContext(): Promise<ClientContext> {
  const ctx = await getClientContext()
  if (!ctx) redirect('/login')
  return ctx
}
