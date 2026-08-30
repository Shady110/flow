'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import RevealHeading from './ui/RevealHeading'
import Reveal from './ui/Reveal'
import MagneticButton from './ui/MagneticButton'

/**
 * The closing ask.
 *
 * The page previously ended on the contact form, which asks for seven fields
 * from someone who has not yet been asked for anything. This band states the
 * offer once, in one sentence, and points at the form — so the commitment is
 * made before the work of filling it in starts.
 */
export default function FinalCTA() {
  const t = useTranslations('marketing.finalCta')

  return (
    <section
      className="relative overflow-hidden grain-overlay py-20 md:py-24"
      style={{ backgroundImage: 'var(--gradient-dark-panel)' }}
    >
      {/* A single soft lime wash behind the heading, centred rather than
          handed, so it needs no mirroring in Arabic. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(196,240,117,0.14) 0%, transparent 68%)' }}
      />

      <div className="section-container relative flex flex-col items-center text-center">
        <RevealHeading
          text={t('heading')}
          accent={t('heading').split(' ').slice(-2)}
          accentTone="light"
          className="max-w-3xl font-display text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-white sm:text-4xl md:text-5xl"
        />
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/60">{t('intro')}</p>
        </Reveal>
        <Reveal delay={0.16} className="mt-9">
          <MagneticButton>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-flow-lime px-8 py-4 text-sm font-semibold text-flow-green shadow-[var(--shadow-glow-lime)] transition-colors hover:bg-flow-lime-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-lime focus-visible:ring-offset-2 focus-visible:ring-offset-flow-green-deep"
            >
              {t('cta')}
              <ArrowRight size={16} className="rtl:-scale-x-100" />
            </Link>
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}

FinalCTA.displayName = 'FinalCTA'
