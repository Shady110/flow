import 'server-only'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Client, ClientUser } from '@/lib/types'

export interface ClientContext {
  email: string
  clientUser: ClientUser
  client: Client
}

/**
 * Resolve the current client-portal user for the tenant of the current
 * subdomain. Returns null if not signed in, not a client user, or if the
 * signed-in user belongs to a *different* client than the subdomain (a hard
 * security boundary — no cross-tenant access).
 */
export async function getClientContext(): Promise<ClientContext | null> {
  const tenantSlug = (await headers()).get('x-tenant-slug')
  if (!tenantSlug) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: clientUser } = await supabase
    .from('client_users')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!clientUser) return null

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientUser.client_id)
    .maybeSingle()
  if (!client) return null

  // Enforce that the session's client matches the requested subdomain.
  if (client.slug !== tenantSlug) return null

  return { email: user.email ?? '', clientUser, client }
}

export async function requireClientContext(): Promise<ClientContext> {
  const ctx = await getClientContext()
  if (!ctx) redirect('/login')
  return ctx
}
