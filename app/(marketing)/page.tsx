import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { getLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { getLandingContent } from '@/lib/db/landing'
import type { Locale } from '@/i18n/config'
import Navbar from '@/components/Navbar'
import ScrollProgress from '@/components/ui/ScrollProgress'
import HeroSection from '@/components/HeroSection'
import LogoMarquee from '@/components/LogoMarquee'
import ProblemSection from '@/components/ProblemSection'
import SolutionSection from '@/components/SolutionSection'
import ServicesSection from '@/components/ServicesSection'
import PortfolioGridSection from '@/components/PortfolioGridSection'
import WorkflowSection from '@/components/WorkflowSection'
// import TeamSection from '@/components/TeamSection' // hidden until the full team photo is ready
import FAQSection from '@/components/FAQSection'

const PricingSection = dynamic(
  () => import('@/components/PricingSection'),
  { loading: () => <div className="h-96 animate-pulse bg-flow-bg-soft rounded-xl" /> }
)

const ContactSection = dynamic(
  () => import('@/components/ContactSection'),
  { loading: () => <div className="h-96 animate-pulse bg-flow-bg-soft rounded-xl" /> }
)

const PackageBuilderSection = dynamic(
  () => import('@/components/PackageBuilderSection'),
  { loading: () => <div className="h-96 animate-pulse bg-flow-bg-soft rounded-xl" /> }
)

// Chrome, not content: it must not block the page or ship in the first payload.
const ChatWidget = dynamic(() => import('@/components/ChatWidget'))

import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'E-Commerce Content Agency in Egypt | Product Photography, Listing Optimization & Account Management',
  description:
    'FLOW Agency helps Amazon, Noon, TikTok Shop & Shopify sellers ' +
    'in Egypt with professional product photography, bilingual listing ' +
    'content, SEO optimization, and full marketplace account management. ' +
    'Monthly growth plans from 3,500 EGP, or per-item content from 10 EGP.',
  alternates: {
    canonical: 'https://flow-agency-eg.com',
  },
}

export default async function Home() {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('marketing.trust')
  const content = await getLandingContent(locale)

  return (
    <main>
      <ScrollProgress />
      <Navbar />
      <HeroSection content={content.hero} />

      {/* Trust strip */}
      <section className="bg-flow-bg border-y border-flow-border py-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-flow-text-muted mb-7">
            {t('title')}
          </p>
          <LogoMarquee />
        </div>
      </section>

      <ProblemSection />
      <SolutionSection />
      <ServicesSection content={content.services} />
      {/* Pricing sits straight after Services: once someone understands what we
          do, the plans are the next thing they want — not 3 sections later. */}
      <PricingSection content={content.pricing} />
      {/* Straight after the fixed plans: someone who just decided none of the
          three tabs fits them is exactly who the configurator is for. */}
      <PackageBuilderSection pricing={content.pricing} />
      <PortfolioGridSection />
      <WorkflowSection />
      {/* <TeamSection /> hidden until the full team photo is ready */}
      <FAQSection content={content.faq} />
      <ContactSection content={content.contact} />
      <Footer />
      <ChatWidget />
    </main>
  )
}
