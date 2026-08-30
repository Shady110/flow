'use client'

import Link from 'next/link'
import { ArrowRight, SlidersHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'
import RevealHeading from './ui/RevealHeading'
import Reveal from './ui/Reveal'
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
    <section
      id="pricing"
      className="relative overflow-hidden py-24 md:py-28"
      style={{ backgroundImage: 'var(--gradient-dark-panel)' }}
    >
      <div className="section-container">
        <div className="grid items-end gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal y={16}>
              <span className="eyebrow-index text-flow-lime/80" data-index="06">
                {t('eyebrow')}
              </span>
            </Reveal>
            <RevealHeading
              text={t('heading')}
              accent={t.raw('accent') as string[]}
              accentTone="light"
              className="mt-6 font-display text-4xl font-bold leading-[1.02] tracking-tight text-white md:text-5xl lg:text-6xl"
            />
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/60">{t('intro')}</p>
            </Reveal>
          </div>

          {/* The numbers get their own column and are set as large as the
              heading — they are the reason this band exists. */}
          <div className="lg:col-span-5 lg:col-start-8">
            <Reveal delay={0.15} className="grid grid-cols-2 gap-8 border-t border-white/15 pt-7">
              {figures.map((f) => (
                <div key={f.label}>
                  <p className="font-display text-3xl font-bold text-flow-lime sm:text-4xl">
                    <Counter value={f.value} suffix={` ${CURRENCY}`} />
                  </p>
                  <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.14em] text-white/50">
                    {f.label}
                  </p>
                </div>
              ))}
            </Reveal>
            <Reveal delay={0.2} className="mt-8">
              <MagneticButton className="w-full">
                <Link
                  href="/pricing"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-flow-lime px-7 py-3.5 text-sm font-semibold text-flow-green shadow-[var(--shadow-glow-lime)] transition-colors hover:bg-flow-lime-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-lime focus-visible:ring-offset-2 focus-visible:ring-offset-flow-green-deep"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {t('cta')}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </MagneticButton>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
