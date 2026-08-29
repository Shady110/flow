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
import StorySection from '@/components/StorySection'
import ServicesSection from '@/components/ServicesSection'
import PortfolioTeaser from '@/components/PortfolioTeaser'
import WorkflowSection from '@/components/WorkflowSection'
// import TeamSection from '@/components/TeamSection' // hidden until the full team photo is ready
import FAQSection from '@/components/FAQSection'
import FinalCTA from '@/components/FinalCTA'

const ContactSection = dynamic(
  () => import('@/components/ContactSection'),
  { loading: () => <div className="h-96 animate-pulse bg-flow-bg-soft rounded-xl" /> }
)

import PricingTeaser from '@/components/PricingTeaser'

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

      {/* Trust strip — a thin hairline band folded tight under the hero, so it
          reads as the hero's footing rather than as a section of its own. */}
      <section className="border-t border-flow-border bg-flow-bg pb-12 pt-8">
        <div className="section-container">
          <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-flow-text-muted">
            {t('title')}
          </p>
          <LogoMarquee />
        </div>
      </section>

      {/* The difficulty and the answer to it, as one dark panel. They were two
          sections with a ground change between them, which let a reader leave
          between the setup and the payoff. */}
      <StorySection />
      <ServicesSection content={content.services} />
      {/* Work before price. Someone still deciding whether we are any good is
          not yet asking what it costs — and the plans land far better once the
          photography has answered the first question. */}
      <PortfolioTeaser />
      <WorkflowSection />
      {/* The full tabs and the package builder live on /pricing. This band keeps
          a number in front of visitors who never click through. */}
      <PricingTeaser />
      {/* <TeamSection /> hidden until the full team photo is ready */}
      <FAQSection content={content.faq} email={content.contact.email} />
      {/* States the offer once before asking anyone to fill in seven fields. */}
      <FinalCTA />
      <ContactSection content={content.contact} />
      <Footer />
    </main>
  )
}
