import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, isLocale, LOCALE_COOKIE } from './config'

/**
 * Locale is resolved from the NEXT_LOCALE cookie (cookie-based i18n, no URL
 * prefix) so it coexists with the subdomain tenant routing in proxy.ts.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(LOCALE_COOKIE)?.value
  const locale = isLocale(cookieValue) ? cookieValue : defaultLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
