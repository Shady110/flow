import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { getClientContext } from '@/lib/auth/client-session'
import { lookupAccount } from '@/lib/auth/account'

/**
 * What the sign-in page should do for whoever is looking at it: send a valid
 * session home, show the friendly "wrong address" screen for the other kind of
 * account, or show the form. (The proxy handles tagged sessions; this also
 * covers sessions issued before accounts were tagged.)
 */
export async function loginGate(portal: 'internal' | 'client'): Promise<'form' | 'wrong'> {
  const valid = portal === 'internal' ? await getCurrentUser() : await getClientContext()
  if (valid) redirect('/')

  const {
    data: { user },
  } = await (await createClient()).auth.getUser()
  if (!user) return 'form'
  const account = await lookupAccount(user.id)
  const home = portal === 'internal' ? 'staff' : 'client'
  return account && account.kind !== home ? 'wrong' : 'form'
}
