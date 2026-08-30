'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowUpRight } from 'lucide-react'
import { portfolioData, getAllImagesFromCategory } from '@/data/portfolioData'
import RevealHeading from './ui/RevealHeading'
import Reveal from './ui/Reveal'
import Counter from './ui/Counter'
import MagneticButton from './ui/MagneticButton'
import { PortfolioArt } from './ui/illustrations'

// Counted from the real catalogue rather than written into copy, so the
// numbers cannot drift from the portfolio they advertise.
const totalShots = portfolioData.reduce((sum, c) => sum + getAllImagesFromCategory(c).length, 0)
const totalCategories = portfolioData.length

/**
 * The landing page's portfolio band.
 *
 * This used to be a bento of eight real category covers — a second portfolio,
 * competing with the actual one a click away, and the heaviest block of images
 * on the page. It now works the way the pricing band does: state the scale,
 * show a demo of what the real page does, and send people there.
 */
export default function PortfolioTeaser() {
  const t = useTranslations('marketing.portfolio')

  const figures = [
    { value: totalShots, suffix: '+', label: t('productsShot') },
    { value: totalCategories, suffix: '', label: t('categories') },
  ]

  return (
    <section id="work" className="relative overflow-hidden bg-flow-bg py-24 md:py-28">
      <div className="section-container">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal y={16}>
              <span className="eyebrow-index text-flow-text-muted" data-index="04">
                {t('eyebrow')}
              </span>
            </Reveal>
            <RevealHeading
              text={t('heading')}
              className="section-title mt-6"
            />
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-flow-text-muted">
                {t('pageIntro')}
              </p>
            </Reveal>

            <Reveal delay={0.15} className="mt-9 grid max-w-md grid-cols-2 gap-8 border-t border-flow-border pt-7">
              {figures.map((f) => (
                <div key={f.label}>
                  <p className="font-display text-3xl font-bold text-flow-green sm:text-4xl">
                    <Counter value={f.value} suffix={f.suffix} />
                  </p>
                  <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.14em] text-flow-text-muted">
                    {f.label}
                  </p>
                </div>
              ))}
            </Reveal>

            <Reveal delay={0.2} className="mt-9">
              <MagneticButton>
                <Link
                  href="/portfolio"
                  className="inline-flex items-center gap-2 rounded-full bg-flow-green px-7 py-3.5 text-sm font-semibold text-flow-bg shadow-[var(--shadow-md)] transition-colors hover:bg-flow-green-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-green focus-visible:ring-offset-2"
                >
                  {t('cta')}
                  <ArrowUpRight size={16} className="rtl:-scale-x-100" />
                </Link>
              </MagneticButton>
            </Reveal>
          </div>

          {/* The demo: what the portfolio page does, drawn rather than loaded. */}
          <Reveal delay={0.1} y={24} className="lg:col-span-6">
            <div className="rounded-3xl border border-white/10 p-6 shadow-[var(--shadow-xl)] sm:p-8"
              style={{ backgroundImage: 'var(--gradient-dark-panel)' }}>
              <PortfolioArt />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

PortfolioTeaser.displayName = 'PortfolioTeaser'
