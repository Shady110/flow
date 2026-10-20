'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient as createStatelessClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAuthEvent } from '@/lib/auth/events'
import { lookupAccount, tagAccount } from '@/lib/auth/account'
import { checkPassword } from '@/lib/auth/password-policy'
import { sendResetLink } from '@/lib/auth/reset'
import { portalOrigin } from '@/lib/tenant'

const ROOT = () => process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000'

export type SignInResult =
  | { ok: true; mustChange: boolean }
  | { ok: false; error: 'invalid' | 'disabled' | 'generic' }
  | { ok: false; error: 'wrongAddress'; otherOrigin: string }

const signInSchema = z.object({ email: z.string().trim().email().max(200), password: z.string().min(1).max(200) })

/**
 * Sign in on the current dashboard. Checks the account is the right kind for
 * this address (team vs client), is not disabled, logs the attempt, and tells the
 * screen what to do next.
 */
export async function signInAction(input: unknown): Promise<SignInResult> {
  const portal = (await headers()).get('x-portal')
  if (portal !== 'internal' && portal !== 'client') return { ok: false, error: 'generic' }
  const parsed = signInSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid' }
  const { email, password } = parsed.data

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) {
    await logAuthEvent({ event: 'sign_in_failed', email })
    return { ok: false, error: /banned/i.test(error?.message ?? '') ? 'disabled' : /invalid|credentials/i.test(error?.message ?? '') ? 'invalid' : 'generic' }
  }

  const user = data.user
  const account = await lookupAccount(user.id)
  if (!account) {
    await supabase.auth.signOut()
    await logAuthEvent({ event: 'sign_in_failed', userId: user.id, email })
    return { ok: false, error: 'invalid' }
  }
  if (!account.active) {
    await supabase.auth.signOut()
    await logAuthEvent({ event: 'sign_in_failed', userId: user.id, email, kind: account.kind })
    return { ok: false, error: 'disabled' }
  }

  const home = portal === 'internal' ? 'staff' : 'client'
  if (account.kind !== home) {
    await supabase.auth.signOut()
    await logAuthEvent({ event: 'wrong_address', userId: user.id, email, kind: account.kind })
    return { ok: false, error: 'wrongAddress', otherOrigin: portalOrigin(account.kind === 'staff' ? 'internal' : 'client', ROOT()) }
  }

  // Heal accounts created before kinds were tagged, so the proxy can read it from the token.
  if (user.app_metadata?.kind !== account.kind) {
    await tagAccount(user.id, account.kind, user.app_metadata)
    await supabase.auth.refreshSession()
  }

  await logAuthEvent({ event: 'sign_in', userId: user.id, email, kind: account.kind })
  return { ok: true, mustChange: user.app_metadata?.must_change_password === true }
}

export async function signOut() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) await logAuthEvent({ event: 'sign_out', userId: user.id, email: user.email, kind: user.app_metadata?.kind })
  await supabase.auth.signOut()
  redirect('/login')
}

export type PasswordResult = { ok: true } | { ok: false; error: 'notSignedIn' | 'weak' | 'wrongCurrent' | 'generic' }

const changeSchema = z.object({ current: z.string().max(200).optional(), next: z.string().min(1).max(200) })

/**
 * Choose a new password. When a change is owed (first sign-in, one-time password
 * from the CEO, or an emailed reset link) no current password is asked; a
 * voluntary change must prove the current one.
 */
export async function changePasswordAction(input: unknown): Promise<PasswordResult> {
  const parsed = changeSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'weak' }

  const supabase = await createClient()
  // getUser() asks the server, so the owed-change flag cannot be faked from a stale token.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return { ok: false, error: 'notSignedIn' }

  if (!checkPassword(parsed.data.next, user.email).ok) return { ok: false, error: 'weak' }

  const owed = user.app_metadata?.must_change_password === true
  if (!owed) {
    if (!parsed.data.current) return { ok: false, error: 'wrongCurrent' }
    const probe = createStatelessClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { error } = await probe.auth.signInWithPassword({ email: user.email, password: parsed.data.current })
    if (error) return { ok: false, error: 'wrongCurrent' }
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.next })
  if (error) return { ok: false, error: 'generic' }

  if (owed) {
    await createAdminClient().auth.admin.updateUserById(user.id, { app_metadata: { ...user.app_metadata, must_change_password: false } })
  }
  await supabase.auth.refreshSession()
  await logAuthEvent({ event: 'password_changed', userId: user.id, email: user.email, kind: user.app_metadata?.kind })
  return { ok: true }
}

/**
 * "Forgot password": always answers the same, whether or not the email exists,
 * and sends at most one email a minute per address.
 */
export async function requestResetAction(input: unknown): Promise<{ ok: true }> {
  const parsed = z.string().trim().email().max(200).safeParse(input)
  if (!parsed.success) return { ok: true }
  const email = parsed.data.toLowerCase()

  const admin = createAdminClient()
  const since = new Date(Date.now() - 60_000).toISOString()
  const { count } = await admin
    .from('auth_events')
    .select('id', { count: 'exact', head: true })
    .eq('event', 'reset_requested')
    .eq('email', email)
    .gte('created_at', since)
  if ((count ?? 0) > 0) return { ok: true }

  await logAuthEvent({ event: 'reset_requested', email })
  try {
    await sendResetLink(email)
  } catch (e) {
    console.error('[auth] reset email failed', e)
  }
  return { ok: true }
}
