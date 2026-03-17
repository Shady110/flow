'use client'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-flow-bg-soft">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          custom={0}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-flow-lime bg-flow-green px-3 py-1 rounded-full inline-block mb-4">
            Pricing
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-flow-green mt-4 mb-4">
            Simple, transparent pricing.
          </h2>
          <p className="text-flow-text-muted text-base leading-relaxed max-w-2xl mx-auto">
            All prices in Egyptian Pounds (EGP). Volume discounts available for large batches.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 — Listing Optimization Only */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            custom={1}
            className="bg-white rounded-2xl border border-flow-border p-8 flex flex-col"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-flow-text-muted mb-4">
              Premium Content Only
            </p>
            <div className="mb-1">
              <span className="font-display text-4xl font-bold text-flow-green">15 EGP</span>
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
            viewport={{ once: true, amount: 0.2 }}
            custom={2}
            className="bg-white rounded-2xl border border-flow-border p-8 flex flex-col"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-flow-text-muted mb-4">
              Studio Photography Package
            </p>
            <div className="mb-1">
              <span className="font-display text-4xl font-bold text-flow-green">30 EGP</span>
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
            viewport={{ once: true, amount: 0.2 }}
            custom={3}
            className="rounded-2xl p-8 flex flex-col relative lg:row-span-1 md:col-span-2 lg:col-span-1"
            style={{ backgroundColor: '#1B4D2E' }}
          >
            <span className="absolute top-4 right-4 bg-flow-lime text-flow-green text-xs font-bold px-3 py-1 rounded-full">
              Most Popular
            </span>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-4">
              Photography + Professional Listing
            </p>
            <div className="mb-1">
              <span className="font-display text-4xl font-bold text-white">40 EGP</span>
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
            <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: '#163D24' }}>
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

            <a
              href="#contact"
              className="block text-center bg-flow-lime text-flow-green font-bold py-3.5 rounded-xl hover:bg-flow-lime-hover transition-colors text-sm"
            >
              Start Your Flow
            </a>
          </motion.div>

          {/* Card 4 — Product Video */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            custom={4}
            className="bg-white rounded-2xl border border-flow-border p-8 flex flex-col"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-flow-text-muted mb-4">
              Professional Video Production
            </p>
            <div className="mb-1">
              <span className="font-display text-4xl font-bold text-flow-green">500 EGP</span>
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

          {/* Card 5 — Social Media Content */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            custom={5}
            className="bg-white rounded-2xl border border-flow-border p-8 flex flex-col relative"
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

          {/* Card 6 — E-commerce Website */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            custom={6}
            className="bg-white rounded-2xl border border-flow-border p-8 flex flex-col relative opacity-75"
          >
            <span className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">
              Coming Soon
            </span>
            <p className="text-xs font-semibold uppercase tracking-widest text-flow-text-muted mb-4">
              Website Creation Service
            </p>
            <div className="mb-1">
              <span className="font-display text-4xl font-bold text-gray-400">—</span>
            </div>
            <p className="text-sm text-flow-text-muted mb-6">Pricing available soon</p>
            <p className="font-semibold text-flow-green text-base mb-4">E-commerce Website</p>
            <ul className="space-y-3 flex-1 mb-8">
              {[
                'Custom e-commerce website design',
                'Product catalog integration',
                'Marketplace-ready storefront',
                'Pricing available soon',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-flow-text-muted">
                  <Check size={14} className="text-gray-300 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="block w-full text-center border-2 border-gray-200 text-gray-400 font-semibold py-3 rounded-xl cursor-not-allowed text-sm"
            >
              Notify Me
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
