'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, SlidersHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { fadeUp } from '@/lib/animations'
import RevealHeading from './ui/RevealHeading'
import MagneticButton from './ui/MagneticButton'
import Counter from './ui/Counter'
import { CONTENT_RATES, GROWTH_TIERS, CURRENCY } from '@/lib/pricing/quote'

/**
 * The landing page's pricing band. Full tabs and the package builder live on
 * /pricing — this exists so a visitor still sees a number without clicking,
 * which for an agency site is most of the conversion.
 *
 * The two figures come from the rate card rather than copy, so they cannot
 * drift from the plans they advertise.
 */
export default function PricingTeaser() {
  const t = useTranslations('marketing.pricingTeaser')
  const cheapestMonthly = Math.min(...GROWTH_TIERS.map((tier) => tier.monthly))

  const figures = [
    { value: CONTENT_RATES.listing, label: t('fromContent') },
    { value: cheapestMonthly, label: t('fromMonthly') },
  ]

  return (
    <section id="pricing" className="section-padding bg-flow-bg">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8"
      >
        <div className="grid items-center gap-10 rounded-3xl border border-flow-border bg-white p-8 shadow-[var(--shadow-sm)] sm:p-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <span className="eyebrow-index mb-6" data-index="04">
              {t('eyebrow')}
            </span>
            <RevealHeading
              text={t('heading')}
              accent={t.raw('accent') as string[]}
              className="section-title mt-6 mb-5"
            />
            <p className="max-w-xl text-base leading-relaxed text-flow-text-muted">{t('intro')}</p>
          </div>

          <div className="lg:col-span-5">
            <div className="mb-7 grid grid-cols-2 gap-6">
              {figures.map((f) => (
                <div key={f.label}>
                  <p className="font-display text-4xl font-bold text-flow-green">
                    <Counter value={f.value} suffix={` ${CURRENCY}`} />
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-flow-text-muted">
                    {f.label}
                  </p>
                </div>
              ))}
            </div>
            <MagneticButton className="w-full">
              <Link
                href="/pricing"
                className="btn-primary flex w-full items-center justify-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t('cta')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </MagneticButton>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
