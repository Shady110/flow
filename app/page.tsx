import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import ProblemSection from '@/components/ProblemSection'
import SolutionSection from '@/components/SolutionSection'
import ServicesSection from '@/components/ServicesSection'
import WorkflowSection from '@/components/WorkflowSection'
import PricingSection from '@/components/PricingSection'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'E-Commerce Content Agency in Egypt | Product Photography, Listing Optimization & Account Management',
  description:
    'FLOW Agency helps Amazon, Noon, TikTok Shop & Shopify sellers ' +
    'in Egypt with professional product photography, bilingual listing ' +
    'content, SEO optimization, and full marketplace account management. ' +
    'Starting from 15 EGP per product.',
  alternates: {
    canonical: 'https://flow-agency-eg.com',
  },
}

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <ServicesSection />

      {/* Portfolio CTA */}
      <section className="py-16 bg-flow-bg-soft">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl font-bold text-flow-green">
              See our work in action.
            </h3>
            <p className="text-flow-text-muted mt-1">
              Browse 210+ product photos across every category.
            </p>
          </div>
          <Link
            href="/portfolio"
            className="bg-flow-green text-white font-semibold px-6 py-3 rounded-full hover:bg-flow-green-hover transition-colors whitespace-nowrap"
          >
            View Portfolio →
          </Link>
        </div>
      </section>

      <WorkflowSection />
      <PricingSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
