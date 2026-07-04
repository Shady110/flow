'use client'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { fadeUp } from '@/lib/animations'
import Counter from './ui/Counter'
import MagneticButton from './ui/MagneticButton'
import RevealHeading from './ui/RevealHeading'

export default function PricingSection() {
  return (
    <section id="pricing" className="section-padding bg-flow-bg-soft">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          custom={0}
          className="flex flex-col items-center text-center mb-16"
        >
          <span className="eyebrow-index mb-6" data-index="06">Pricing</span>
          <RevealHeading
            text="Simple, transparent pricing."
            accent={['transparent']}
            className="section-title mt-6 mb-4"
          />
          <p className="text-flow-text-muted text-base leading-relaxed max-w-2xl mx-auto">
            All prices in Egyptian Pounds (EGP). Volume discounts available for large batches.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:items-center">
          {/* Card 1 — Listing Optimization Only */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={1}
            className="surface-elevated p-8 flex flex-col"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-flow-text-muted mb-4">
              Premium Content Only
            </p>
            <div className="mb-1">
              <span className="font-display text-4xl font-bold text-flow-green">
                <Counter value={15} suffix=" EGP" />
              </span>
            </div>
            <p className="text-sm text-flow-text-muted mb-6">/ per product</p>
            <p className="font-semibold text-flow-green text-base mb-4">Listing Optimization Only</p>
            <ul className="space-y-3 flex-1 mb-8">
              {[
                'Compelling, value-focused professional title',
                'Bilingual description (Arabic + English)',
                'Targeted keywords & SEO best practices',
                'Marketing-oriented conversion copy',
                'Platform-compliant formatting',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-flow-text-muted">
                  <Check size={14} className="text-flow-green mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              className="block text-center border-2 border-flow-green text-flow-green font-semibold py-3 rounded-xl hover:bg-flow-green hover:text-white transition-colors text-sm"
            >
              Get Started
            </a>
          </motion.div>

          {/* Card 2 — Photography Only */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={2}
            className="surface-elevated p-8 flex flex-col"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-flow-text-muted mb-4">
              Studio Photography Package
            </p>
            <div className="mb-1">
              <span className="font-display text-4xl font-bold text-flow-green">
                <Counter value={30} suffix=" EGP" />
              </span>
            </div>
            <p className="text-sm text-flow-text-muted mb-6">/ per product</p>
            <p className="font-semibold text-flow-green text-base mb-4">Photography Only</p>
            <ul className="space-y-3 flex-1 mb-4">
              {[
                'Professional studio photography',
                'White background shots',
                'Full editing & optimization',
                '3–5 high-resolution photos',
                'Large items (furniture, appliances): 150 EGP → up to 10 photos',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-flow-text-muted">
                  <Check size={14} className="text-flow-green mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <p className="text-xs text-flow-text-muted italic mb-6">
              On-location shoots incur additional transportation fees.
            </p>
            <a
              href="#contact"
              className="block text-center border-2 border-flow-green text-flow-green font-semibold py-3 rounded-xl hover:bg-flow-green hover:text-white transition-colors text-sm"
            >
              Get Started
            </a>
          </motion.div>

          {/* Card 3 — Complete Package (FEATURED) */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={3}
            className="glass-card-dark p-8 lg:p-10 flex flex-col relative z-10 md:col-span-2 lg:col-span-1 lg:-my-6 lg:scale-105 origin-center"
            style={{ backgroundImage: 'var(--gradient-dark-panel)', boxShadow: 'var(--shadow-glow-lime)' }}
          >
            <span className="absolute top-4 right-4 bg-flow-lime text-flow-green text-xs font-bold px-3 py-1 rounded-full">
              Most Popular
            </span>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-4">
              Photography + Professional Listing
            </p>
            <div className="mb-1">
              <span className="font-display text-4xl font-bold text-white">
                <Counter value={40} suffix=" EGP" />
              </span>
            </div>
            <p className="text-sm text-white/60 mb-6">/ per product</p>
            <p className="font-semibold text-flow-lime text-base mb-4">Complete Package</p>
            <ul className="space-y-3 flex-1 mb-6">
              {[
                'Studio photography on white background',
                'Professional retouching & editing',
                '3–5 high-resolution photos',
                'Bilingual description (Arabic + English)',
                'SEO-optimized title & strategic keywords',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                  <Check size={14} className="text-flow-lime mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {/* Bulk discount block */}
            <div className="rounded-xl p-4 mb-6 bg-black/20 border border-white/10">
              <p className="text-xs font-bold text-flow-lime uppercase tracking-wider mb-3">
                Bulk Discounts
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">500+ items</span>
                  <span className="text-white font-semibold">30 EGP / product</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">1,000+ items</span>
                  <span className="text-white font-semibold">20 EGP / product</span>
                </div>
              </div>
            </div>

            <MagneticButton className="block w-full">
              <a
                href="#contact"
                className="block text-center bg-flow-lime text-flow-green font-bold py-3.5 rounded-xl hover:bg-flow-lime-hover transition-colors text-sm shadow-[var(--shadow-glow-lime)]"
              >
                Start Your Flow
              </a>
            </MagneticButton>
          </motion.div>

          {/* Card 4 — Product Video */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={4}
            className="surface-elevated p-8 flex flex-col"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-flow-text-muted mb-4">
              Professional Video Production
            </p>
            <div className="mb-1">
              <span className="font-display text-4xl font-bold text-flow-green">
                <Counter value={500} suffix=" EGP" />
              </span>
            </div>
            <p className="text-sm text-flow-text-muted mb-6">/ per video</p>
            <p className="font-semibold text-flow-green text-base mb-4">Product Video</p>
            <ul className="space-y-3 flex-1 mb-8">
              {[
                'Professional filming (unboxing, UGC, sponsored ad)',
                'Creative editing & music',
                'Text overlays & final polish',
                'Ready for social media, listings & ads',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-flow-text-muted">
                  <Check size={14} className="text-flow-green mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              className="block text-center border-2 border-flow-green text-flow-green font-semibold py-3 rounded-xl hover:bg-flow-green hover:text-white transition-colors text-sm"
            >
              Get Started
            </a>
          </motion.div>

          {/* Card 5 — E-commerce Website */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={5}
            className="surface-elevated p-8 flex flex-col"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-flow-text-muted mb-4">
              Website Creation Service
            </p>
            <div className="mb-1">
              <span className="font-display text-4xl font-bold text-flow-green">Custom Pricing</span>
            </div>
            <p className="text-sm text-flow-text-muted mb-6">Tailored to your project scope</p>
            <p className="font-semibold text-flow-green text-base mb-4">E-commerce Website</p>
            <ul className="space-y-3 flex-1 mb-8">
              {[
                'Custom e-commerce website design',
                'Product catalog integration',
                'Marketplace-ready storefront',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-flow-text-muted">
                  <Check size={14} className="text-flow-green mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              className="block text-center border-2 border-flow-green text-flow-green font-semibold py-3 rounded-xl hover:bg-flow-green hover:text-white transition-colors text-sm"
            >
              Request a Quote
            </a>
          </motion.div>

          {/* Card 6 — Social Media Content */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={6}
            className="surface-elevated p-8 flex flex-col relative"
          >
            <span className="absolute top-4 right-4 bg-flow-bg-muted text-flow-green text-xs font-bold px-3 py-1 rounded-full border border-flow-border">
              Custom
            </span>
            <p className="text-xs font-semibold uppercase tracking-widest text-flow-text-muted mb-4">
              Photography + Social Media Package
            </p>
            <div className="mb-1">
              <span className="font-display text-3xl font-bold text-flow-green">Custom Pricing</span>
            </div>
            <p className="text-sm text-flow-text-muted mb-6">/ per session</p>
            <p className="font-semibold text-flow-green text-base mb-4">Social Media Content</p>
            <ul className="space-y-3 flex-1 mb-8">
              {[
                'Full creative session: still + lifestyle shots',
                'High-quality professional photography',
                'Ready-to-post social media designs',
                'Instagram, Facebook & TikTok formats',
                'Pricing based on scope & complexity',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-flow-text-muted">
                  <Check size={14} className="text-flow-green mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              className="block text-center border-2 border-flow-green text-flow-green font-semibold py-3 rounded-xl hover:bg-flow-green hover:text-white transition-colors text-sm"
            >
              Request a Quote
            </a>
          </motion.div>

          {/* Card 7 — Account Management (full-width) */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={7}
            className="col-span-1 md:col-span-2 lg:col-span-3 surface-elevated p-8 relative"
          >
            <div className="flex flex-col md:flex-row md:gap-12 md:items-center">
              {/* Left — price & title */}
              <div className="md:w-[35%] mb-8 md:mb-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-flow-text-muted mb-4">
                  Full Marketplace Account Management
                </p>
                <div className="mb-1">
                  <span className="font-display text-4xl font-bold text-flow-green">
                    <Counter value={10000} suffix=" EGP" />
                  </span>
                </div>
                <p className="text-sm text-flow-text-muted mb-1">/ per month</p>
                <p className="text-sm font-semibold text-flow-green mb-6">+ 5% of sales</p>
                <p className="font-semibold text-flow-green text-base mb-6">Account Management</p>
              </div>
              {/* Right — features + button */}
              <div className="md:w-[65%] flex flex-col gap-6">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    'Complete seller account management',
                    'Listing uploads & catalog management',
                    'Product updates & maintenance',
                    'Marketplace compliance monitoring',
                    'Performance tracking & reporting',
                    'Multi-platform support (Amazon, Noon, TikTok Shop, Shopify)',
                    'Dedicated account manager',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-flow-text-muted">
                      <Check size={14} className="text-flow-green mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className="inline-block text-center border-2 border-flow-green text-flow-green font-semibold py-3 px-8 rounded-xl hover:bg-flow-green hover:text-white transition-colors text-sm self-start"
                >
                  Get Started
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

PricingSection.displayName = 'PricingSection'
