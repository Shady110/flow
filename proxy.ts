import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { resolvePortal } from '@/lib/tenant'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000'

/**
 * Multi-tenant proxy (Next.js 16 middleware convention).
 *
 *  1. Refreshes the Supabase auth session cookie on every request.
 *  2. Resolves the portal (marketing / internal / client) from the host.
 *  3. Rewrites into the matching route segment and injects tenant headers.
 *  4. Gates the internal & client portals behind an authenticated session.
 *
 * URL-facing behaviour (rewrites are invisible to the user):
 *   app.flow.com/clients        ->  /internal/clients
 *   acme.flow.com/products      ->  /portal/products     (x-tenant-slug: acme)
 *   flow.com/                   ->  (marketing) unchanged
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const host = request.headers.get('host')
  const { portal, tenant } = resolvePortal(host, ROOT_DOMAIN)

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
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: getUser() also refreshes the session and writes cookies above.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // API routes manage their own auth/clients — never rewrite them.
  if (pathname.startsWith('/api')) {
    return response
  }

  // ---- Marketing: block private segments, otherwise pass through ----------
  if (portal === 'marketing') {
    if (pathname.startsWith('/internal') || pathname.startsWith('/portal')) {
      return new NextResponse('Not Found', { status: 404 })
    }
    return response
  }

  const prefix = portal === 'internal' ? '/internal' : '/portal'
  const isLogin = pathname === '/login' || pathname === `${prefix}/login`

  // ---- Auth gate ----------------------------------------------------------
  if (!user && !isLogin) {
    const url = request.nextUrl.clone()
    if (host) url.host = host // keep the tenant/app subdomain
    url.pathname = '/login'
    return redirectPreservingCookies(url, response)
  }
  if (user && isLogin) {
    const url = request.nextUrl.clone()
    if (host) url.host = host
    url.pathname = '/'
    return redirectPreservingCookies(url, response)
  }

  // ---- Rewrite into the portal's route segment ----------------------------
  // Avoid double-prefixing if the rewrite target is already applied.
  const targetPath = pathname.startsWith(prefix) ? pathname : `${prefix}${pathname === '/' ? '' : pathname}`
  const rewriteResponse = rewrite(request, `${targetPath}${search}`, response, {
    'x-portal': portal,
    ...(tenant ? { 'x-tenant-slug': tenant } : {}),
  })
  return rewriteResponse
}

/** Rewrite while carrying over auth cookies and optional request headers. */
function rewrite(
  request: NextRequest,
  destination: string,
  cookieSource: NextResponse,
  extraHeaders?: Record<string, string>,
) {
  const url = request.nextUrl.clone()
  const [path, qs] = destination.split('?')
  url.pathname = path
  url.search = qs ? `?${qs}` : url.search

  const requestHeaders = new Headers(request.headers)
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) requestHeaders.set(k, v)
  }

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
