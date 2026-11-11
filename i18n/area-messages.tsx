import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'

type Tree = Record<string, unknown>

/** Copies the listed namespaces ("portal" or a dotted "internal.tickets") out of the full catalogue. */
function pick(all: Tree, paths: string[]): Tree {
  const out: Tree = {}
  for (const path of paths) {
    const keys = path.split('.')
    let src: unknown = all
    let dst = out
    keys.forEach((k, i) => {
      src = (src as Tree | undefined)?.[k]
      if (i === keys.length - 1) dst[k] = src
      else dst = (dst[k] ??= {}) as Tree
    })
  }
  return out
}

/**
 * Wraps one area with only the strings its client components use, so the root
 * layout doesn't ship the whole catalogue (the team dashboard alone is ~27 KB).
 * Server components read messages on the server and are unaffected.
 */
export async function AreaMessages({ namespaces, children }: { namespaces: string[]; children: React.ReactNode }) {
  const [locale, all] = await Promise.all([getLocale(), getMessages()])
  return (
    <NextIntlClientProvider locale={locale} messages={pick(all as Tree, namespaces)}>
      {children}
    </NextIntlClientProvider>
  )
}
