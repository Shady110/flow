import 'server-only'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import type { AccountKind } from '@/lib/auth/route-guard'

export type AuthEventName =
  | 'sign_in'
  | 'sign_in_failed'
  | 'wrong_address'
  | 'sign_out'
  | 'password_changed'
  | 'reset_requested'
  | 'reset_by_admin'

/** Append to the sign-in activity log. Best-effort: logging must never break signing in. */
export async function logAuthEvent(e: {
  event: AuthEventName
  userId?: string | null
  email?: string | null
  kind?: AccountKind | null
  actorId?: string | null
}) {
  try {
    const h = await headers()
    await createAdminClient()
      .from('auth_events')
      .insert({
        event: e.event,
        user_id: e.userId ?? null,
        email: e.email?.toLowerCase() ?? null,
        kind: e.kind ?? null,
        actor_id: e.actorId ?? null,
        host: h.get('host'),
        ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip'),
        user_agent: h.get('user-agent')?.slice(0, 300) ?? null,
      })
  } catch (err) {
    console.error('[auth] could not log event', err)
  }
}
