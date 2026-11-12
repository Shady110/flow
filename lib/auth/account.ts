import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import type { AccountKind } from '@/lib/auth/route-guard'

/**
 * What kind of account is this login, and may it sign in? Looked up from the
 * database (not the token) so it also heals sessions issued before accounts
 * were tagged.
 */
export async function lookupAccount(userId: string): Promise<{ kind: AccountKind; active: boolean } | null> {
  const admin = createAdminClient()
  const [{ data: profile }, { data: clientUser }] = await Promise.all([
    admin.from('profiles').select('status').eq('id', userId).maybeSingle(),
    admin.from('client_users').select('status').eq('user_id', userId).maybeSingle(),
  ])
  if (profile) return { kind: 'staff', active: profile.status !== 'disabled' }
  if (clientUser) return { kind: 'client', active: clientUser.status === 'active' }
  return null
}

/** Tag the auth user so the proxy can read the kind from the token. Keeps other app_metadata. */
export async function tagAccount(
  userId: string,
  kind: AccountKind,
  current: Record<string, unknown> | undefined,
  extra: Record<string, unknown> = {},
) {
  await createAdminClient().auth.admin.updateUserById(userId, { app_metadata: { ...current, kind, ...extra } })
}

/** Block (or allow) signing in at the auth server, on top of the app-level status checks. */
export async function setBanned(userId: string, banned: boolean) {
  await createAdminClient().auth.admin.updateUserById(userId, { ban_duration: banned ? '876000h' : 'none' })
}
