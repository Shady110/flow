import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { getLocale } from 'next-intl/server'
import { getLandingContent } from '@/lib/db/landing'
import type { Locale } from '@/i18n/config'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollProgress from '@/components/ui/ScrollProgress'

const PricingSection = dynamic(() => import('@/components/PricingSection'), {
  loading: () => <div className="h-96 animate-pulse rounded-xl bg-flow-bg-soft" />,
})

const PackageBuilderSection = dynamic(() => import('@/components/PackageBuilderSection'), {
  loading: () => <div className="h-96 animate-pulse rounded-xl bg-flow-bg-soft" />,
})

// /pricing carries its own contact form. Without it every plan CTA had to throw
// the visitor back to the landing page to convert — a full route change away
// from the prices they were reading. The form belongs where the decision is made.
const ContactSection = dynamic(() => import('@/components/ContactSection'), {
  loading: () => <div className="h-96 animate-pulse rounded-xl bg-flow-bg-soft" />,
})

export const metadata: Metadata = {
  title: 'Pricing | Product Content & Marketplace Management Egypt',
  description:
    'FLOW Agency pricing: per-item content from 10 EGP, seller account ' +
    'management from 2,500 EGP per month, and all-in growth plans from ' +
    '3,500 EGP. Or build a custom package feature by feature.',
  alternates: {
    canonical: 'https://flow-agency-eg.com/pricing',
  },
  openGraph: {
    title: 'FLOW Pricing | Content & Account Management Egypt',
    description:
      'Per-item content from 10 EGP, monthly growth plans from 3,500 EGP, ' +
      'or a custom package built feature by feature.',
    url: 'https://flow-agency-eg.com/pricing',
  },
}

export default async function PricingPage() {
  const locale = (await getLocale()) as Locale
  const content = await getLandingContent(locale)

  return (
    <main>
      <ScrollProgress />
      <Navbar />
      {/* The fixed plans first, then the builder for anyone none of them fits. */}
      <PricingSection content={content.pricing} />
      <PackageBuilderSection />
      <ContactSection content={content.contact} />
      <Footer />
    </main>
  )
}
