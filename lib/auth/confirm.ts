import 'server-only'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAuthEvent } from '@/lib/auth/events'
import { lookupAccount, tagAccount } from '@/lib/auth/account'

/**
 * Landing point of the emailed link. Verifies the one-time token (which signs the
 * person in), marks a password change as owed, and sends them to choose it.
 * A link that is wrong, used or expired goes back to "forgot password".
 */
export async function handleConfirm(request: Request) {
  const url = new URL(request.url)
  const host = request.headers.get('host') ?? url.host
  const origin = `${host.includes('localhost') ? 'http' : 'https'}://${host}`
  const tokenHash = url.searchParams.get('token_hash')
  const expired = NextResponse.redirect(`${origin}/forgot-password?expired=1`)

  if (!tokenHash || url.searchParams.get('type') !== 'recovery') return expired

  const supabase = await createClient()
  const { data, error } = await supabase.auth.verifyOtp({ type: 'recovery', token_hash: tokenHash })
  if (error || !data.user) return expired

  const account = await lookupAccount(data.user.id)
  if (!account?.active) {
    await supabase.auth.signOut()
    return expired
  }
  // Owed password change; refresh so the token carries it.
  await tagAccount(data.user.id, account.kind, data.user.app_metadata, { must_change_password: true })
  await supabase.auth.refreshSession()
  await logAuthEvent({ event: 'sign_in', userId: data.user.id, email: data.user.email, kind: account.kind })

  return NextResponse.redirect(`${origin}/change-password`)
}
