import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import StructuredData from '@/app/structured-data'

// Chrome, not content: neither must block the page or ship in the first payload.
// They live on the layout so every marketing page gets them, not just the landing.
const ChatWidget = dynamic(() => import('@/components/ChatWidget'))
const CookieConsent = dynamic(() => import('@/components/CookieConsent'))

export const metadata: Metadata = {
  metadataBase: new URL('https://flow-agency-eg.com'),

  title: {
    default: 'FLOW Agency | E-Commerce Content & Marketplace Management Egypt',
    template: '%s | FLOW Agency Egypt',
  },

  description:
    'FLOW is Egypt\'s leading e-commerce content agency. ' +
    'We offer product photography, SEO-optimized listings, ' +
    'Amazon & Noon account management, and marketplace growth ' +
    'services for sellers across Egypt and the Arab world.',

  keywords: [
    'ecommerce agency egypt',
    'product photography egypt',
    'amazon listing optimization egypt',
    'noon seller management egypt',
    'marketplace management egypt',
    'amazon account management egypt',
    'ecommerce account manager egypt',
    'product content creation egypt',
    'ecommerce content agency cairo',
    'listing optimization service egypt',
    'amazon agency egypt',
    'noon agency egypt',
    'tiktok shop management egypt',
    'shopify agency egypt',
    'product description writing egypt',
    'ecommerce photography cairo',
    'marketplace seller services egypt',
    'ecommerce website egypt',
    'product video egypt',
    'social media content egypt',
    'flow agency egypt',
    'flow agency',
    'flow ecommerce egypt',
    'وكالة تجارة إلكترونية مصر',
    'تصوير منتجات مصر',
    'إدارة حساب امازون مصر',
    'إدارة حساب نون مصر',
    'تحسين قوائم المنتجات',
    'إدارة متجر إلكتروني مصر',
    'وكالة فلو مصر',
    'تصوير منتجات القاهرة',
    'كتابة وصف منتجات عربي انجليزي',
  ],

  authors: [{ name: 'FLOW Agency', url: 'https://flow-agency-eg.com' }],
  creator: 'FLOW Agency',
  publisher: 'FLOW Agency',

  alternates: {
    canonical: 'https://flow-agency-eg.com',
    languages: {
      'en': 'https://flow-agency-eg.com',
      'ar': 'https://flow-agency-eg.com/ar',
    },
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_EG',
    url: 'https://flow-agency-eg.com',
    siteName: 'FLOW Agency',
    title: 'FLOW Agency | E-Commerce Content & Marketplace Management Egypt',
    description:
      'Product photography, listing optimization, account management & ' +
      'marketplace growth for Amazon, Noon, TikTok Shop & Shopify ' +
      'sellers in Egypt.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FLOW Agency — E-Commerce Content Agency Egypt',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'FLOW Agency | E-Commerce Content Egypt',
    description:
      'Product photography, listing optimization & marketplace ' +
      'account management in Egypt.',
    images: ['/og-image.jpg'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  verification: {
    google: 'aZRBf_0F8me-RHBirHiO08nUL1LjF2958HzT7ZLCTAM',
  },

  category: 'E-Commerce Services',
}

/**
 * Everything on the marketing pages is sized in rem, so one root font-size
 * scales the whole design — type, spacing, container widths and radii together
 * — exactly the way a browser zoom does, rather than shrinking text against
 * fixed padding.
 *
 * 75% is the setting that looked right; it is the only number to change if it
 * wants tuning. Deliberately rendered from *this* layout rather than the root
 * one: rem always resolves against <html>, so scoping by route is the only way
 * to leave /internal and /portal at their own scale. Server-rendered, so it
 * applies on first paint with no resize flash.
 */
const MARKETING_SCALE = '75%'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`html{font-size:${MARKETING_SCALE}}`}</style>
      <StructuredData />
      {children}
      <ChatWidget />
      <CookieConsent />
    </>
  )
}
