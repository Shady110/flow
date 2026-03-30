import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'
import StructuredData from './structured-data'

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
})

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
    google: 'google-site-verification=aZRBf_0F8me-RHBirHiO08nUL1LjF2958HzT7ZLCTAM',
  },

  category: 'E-Commerce Services',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body>
        <StructuredData />
        {children}
      </body>
    </html>
  )
}
