import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollProgress from '@/components/ui/ScrollProgress'
import PortfolioClient from '@/components/portfolio/PortfolioClient'
import { portfolioData } from '@/data/portfolioData'
import { getLocale } from 'next-intl/server'
import { getLandingContent } from '@/lib/db/landing'
import type { Locale } from '@/i18n/config'

export const metadata: Metadata = {
  title: 'Portfolio | Product Photography & E-Commerce Content Egypt',
  description:
    'Browse FLOW Agency\'s portfolio of professional product photography, ' +
    'marketplace listings, and e-commerce content created for Amazon, ' +
    'Noon & TikTok Shop sellers in Egypt.',
  alternates: {
    canonical: 'https://flow-agency-eg.com/portfolio',
  },
  openGraph: {
    title: 'FLOW Portfolio | Product Photography Egypt',
    description:
      'Professional product photography and marketplace content ' +
      'for Amazon, Noon & TikTok Shop sellers in Egypt.',
    url: 'https://flow-agency-eg.com/portfolio',
    images: [{ url: '/og-portfolio.jpg', width: 1200, height: 630 }],
  },
}

export default async function PortfolioPage() {
  const content = await getLandingContent((await getLocale()) as Locale)
  return (
    <main>
      <ScrollProgress />
      <Navbar heroTone="dark" />
      <PortfolioClient data={portfolioData} />
      <Footer contact={content.contact} />
    </main>
  )
}
