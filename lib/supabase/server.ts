import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * Wires Supabase auth cookies to Next's cookie store so sessions persist.
 *
 * Note: in a Server Component the cookie `set` calls will throw (read-only);
 * that's expected — the middleware is responsible for refreshing the session
 * cookie. We swallow the error so Server Components can still read the session.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component — safe to ignore. Middleware refreshes.
          }
        },
      },
    },
  )
}
