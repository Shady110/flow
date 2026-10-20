'use server'

import { randomBytes } from 'crypto'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/session'
import { lookupAccount } from '@/lib/auth/account'
import { logAuthEvent } from '@/lib/auth/events'
import { sendResetLink } from '@/lib/auth/reset'
import { portalOrigin } from '@/lib/tenant'
import type { ActionResult } from '@/lib/db/client-actions'

const targetSchema = z.object({ userId: z.string().uuid() })

/** Who may reset whom: team accounts need users.manage, client logins need clients.edit. */
async function authorise(userId: string) {
  const me = await getCurrentUser()
  if (!me) return { ok: false as const, error: 'Please sign in again.' }
  const account = await lookupAccount(userId)
  if (!account) return { ok: false as const, error: 'Account not found.' }
  const perm = account.kind === 'staff' ? 'users.manage' : 'clients.edit'
  if (!me.permissions.has(perm)) return { ok: false as const, error: 'You do not have permission to do that.' }
  return { ok: true as const, me, account }
}

/**
 * Issue a new one-time password (shown once to the person resetting) and require
 * the account to choose its own at the next sign-in.
 */
export async function resetUserPasswordAction(
  input: unknown,
): Promise<ActionResult & { tempPassword?: string; email?: string; signInUrl?: string; kind?: 'staff' | 'client' }> {
  const parsed = targetSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Something went wrong.' }
  const auth = await authorise(parsed.data.userId)
  if (!auth.ok) return { ok: false, error: auth.error }

  const admin = createAdminClient()
  const { data: existing } = await admin.auth.admin.getUserById(parsed.data.userId)
  if (!existing?.user) return { ok: false, error: 'Account not found.' }

  const tempPassword = randomBytes(9).toString('base64url')
  const { error } = await admin.auth.admin.updateUserById(parsed.data.userId, {
    password: tempPassword,
    app_metadata: { ...existing.user.app_metadata, kind: auth.account.kind, must_change_password: true },
  })
  if (error) return { ok: false, error: error.message }

  await logAuthEvent({ event: 'reset_by_admin', userId: parsed.data.userId, email: existing.user.email, kind: auth.account.kind, actorId: auth.me.id })
  return {
    ok: true,
    tempPassword,
    email: existing.user.email ?? '',
    kind: auth.account.kind,
    signInUrl: portalOrigin(auth.account.kind === 'staff' ? 'internal' : 'client', process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000'),
  }
}

/** Email the person a "choose a new password" link instead of handing over a password. */
export async function emailResetLinkAction(input: unknown): Promise<ActionResult> {
  const parsed = targetSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Something went wrong.' }
  const auth = await authorise(parsed.data.userId)
  if (!auth.ok) return { ok: false, error: auth.error }

  const { data } = await createAdminClient().auth.admin.getUserById(parsed.data.userId)
  const email = data?.user?.email
  if (!email) return { ok: false, error: 'Account not found.' }
  try {
    const sent = await sendResetLink(email)
    if (!sent) return { ok: false, error: 'Could not send the email.' }
  } catch {
    return { ok: false, error: 'Could not send the email. Check the mail settings.' }
  }
  await logAuthEvent({ event: 'reset_requested', userId: parsed.data.userId, email, kind: auth.account.kind, actorId: auth.me.id })
  return { ok: true }
}
