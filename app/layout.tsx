import type { Metadata } from 'next'
import { Funnel_Display, Didact_Gothic, Cairo } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import './globals.css'
import { Providers } from './providers'
import { dirFor, type Locale } from '@/i18n/config'

// Display face. Variable 300-800, so it carries every emphasis weight on the
// site — headings, buttons, badges, numerals. No `weight` key: omitting it
// selects the variable axis.
const funnel = Funnel_Display({
  subsets: ['latin'],
  variable: '--font-funnel',
  display: 'swap',
})

// Body face. Ships a single weight (400) — there is no bold cut, so anything
// that needs emphasis uses the display face rather than a synthesised bold.
const didact = Didact_Gothic({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-didact',
  display: 'swap',
})

// Arabic display + body face. Applied via globals.css when <html lang="ar">.
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://flow-agency-eg.com'),
  title: 'FLOW Agency',
  description: 'FLOW Agency — e-commerce content & marketplace management.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (await getLocale()) as Locale
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      className={`${funnel.variable} ${didact.variable} ${cairo.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
