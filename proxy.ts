import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { resolvePortal, portalOrigin } from '@/lib/tenant'
import { guard, type AccountKind } from '@/lib/auth/route-guard'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000'

/**
 * Proxy (Next.js 16 middleware convention).
 *
 *  1. Refreshes the Supabase session cookie and reads the account's claims
 *     locally (no database call).
 *  2. Resolves the portal from the host: app.<root> = team, portal.<root> =
 *     clients (one shared address, no client name), apex = marketing.
 *  3. Asks the route guard what to do (allow, sign in, change password, or the
 *     friendly wrong-address page) and rewrites into the portal's segment.
 *
 *   app.flow.com/clients     ->  /internal/clients
 *   portal.flow.com/invoices ->  /portal/invoices      (x-portal: client)
 *   acme.flow.com/anything   ->  redirect to portal.flow.com/anything (old links)
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const host = request.headers.get('host')
  const { portal, legacyClient } = resolvePortal(host, ROOT_DOMAIN)

  // Old per-client addresses: send them to the shared client address.
  if (legacyClient) {
    return NextResponse.redirect(`${portalOrigin('client', ROOT_DOMAIN)}${pathname}${search}`, 308)
  }

  // Response we can attach refreshed auth cookies to.
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  // Verifies the token locally and refreshes the session cookie when needed.
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims as
    | { sub?: string; app_metadata?: { kind?: AccountKind; must_change_password?: boolean } }
    | undefined

  // API routes manage their own auth: never rewrite them.
  if (pathname.startsWith('/api')) return response

  // ---- Marketing: block private segments, otherwise pass through ----------
  if (portal === 'marketing') {
    if (pathname.startsWith('/internal') || pathname.startsWith('/portal')) {
      return new NextResponse('Not Found', { status: 404 })
    }
    return response
  }

  const prefix = portal === 'internal' ? '/internal' : '/portal'
  // Strip an already-applied prefix so the guard sees the public path.
  const publicPath = pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : pathname === prefix ? '/' : pathname

  const decision = guard({
    portal,
    signedIn: !!claims?.sub,
    kind: claims?.app_metadata?.kind,
    mustChange: claims?.app_metadata?.must_change_password === true,
    path: publicPath,
  })

  if (decision.type === 'redirect') {
    const url = request.nextUrl.clone()
    if (host) url.host = host
    url.pathname = decision.to
    url.search = ''
    return redirectPreservingCookies(url, response)
  }

  const target = decision.type === 'wrong-address' ? '/wrong-address' : publicPath
  return rewrite(request, `${prefix}${target === '/' ? '' : target}${decision.type === 'wrong-address' ? '' : search}`, response, {
    'x-portal': portal,
  })
}

/** Rewrite while carrying over auth cookies and optional request headers. */
function rewrite(request: NextRequest, destination: string, cookieSource: NextResponse, extraHeaders?: Record<string, string>) {
  const url = request.nextUrl.clone()
  const [path, qs] = destination.split('?')
  url.pathname = path || '/'
  url.search = qs ? `?${qs}` : ''

  const requestHeaders = new Headers(request.headers)
  if (extraHeaders) for (const [k, v] of Object.entries(extraHeaders)) requestHeaders.set(k, v)

  const res = NextResponse.rewrite(url, { request: { headers: requestHeaders } })
  cookieSource.cookies.getAll().forEach((c) => res.cookies.set(c))
  return res
}

function redirectPreservingCookies(url: URL, cookieSource: NextResponse) {
  const res = NextResponse.redirect(url)
  cookieSource.cookies.getAll().forEach((c) => res.cookies.set(c))
  return res
}

export const config = {
  matcher: [
    /*
     * Match everything except Next internals and static assets.
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.png|og-image.jpg|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
