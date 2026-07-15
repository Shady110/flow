'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isLocale, LOCALE_COOKIE, type Locale } from '@/i18n/config'

const ONE_YEAR = 60 * 60 * 24 * 365

/**
 * Persist the visitor's language choice: always to the NEXT_LOCALE cookie, and
 * — for signed-in internal/client users — to their DB row so the preference
 * follows them. Cookie-based (no URL prefix) so it coexists with the tenant
 * subdomain routing in proxy.ts.
 */
export async function setLocaleAction(locale: Locale): Promise<void> {
  if (!isLocale(locale)) return

  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: ONE_YEAR,
    sameSite: 'lax',
  })

  // Best-effort DB persistence for logged-in users (ignored for anon visitors).
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ locale }).eq('id', user.id)
      await supabase.from('client_users').update({ locale }).eq('user_id', user.id)
    }
  } catch {
    // Non-fatal — the cookie is the source of truth for the current session.
  }

  revalidatePath('/', 'layout')
}
