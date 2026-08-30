'use client'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { spring } from '@/lib/animations'
import RevealHeading from '../ui/RevealHeading'
import Counter from '../ui/Counter'

interface Props {
  totalImages: number
  totalCategories: number
}

export default function PortfolioHero({ totalImages, totalCategories }: Props) {
  const t = useTranslations('marketing.portfolio')

  const stats = [
    { value: totalImages, label: t('photos') },
    { value: totalCategories, label: t('categories') },
    { value: 6, label: t('platforms') },
  ]

  return (
    <section
      className="relative overflow-hidden grain-overlay pb-16 pt-36 md:pb-20 md:pt-44"
      style={{ backgroundImage: 'var(--gradient-dark-panel)' }}
    >
      <div className="section-container">
        {/* Off-centre, matching the landing page's cadence rather than the
            centred stack this page used to open with. */}
        <div className="grid gap-x-12 gap-y-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring.ui}
              className="eyebrow-index text-flow-lime/80"
              data-index="01"
            >
              {t('pageEyebrow')}
            </motion.span>
            <RevealHeading
              as="h1"
              text={t('pageHeading')}
              whileInView={false}
              className="mt-6 font-display text-[clamp(2.5rem,3.9vw,5rem)] font-bold leading-[0.98] tracking-[-0.032em] text-white"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.ui, delay: 0.2 }}
            className="flex items-end md:col-span-4"
          >
            <p className="text-base leading-relaxed text-white/60">{t('pageIntro')}</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring.ui, delay: 0.3 }}
          className="mt-14 grid grid-cols-3 gap-6 border-t border-white/15 pt-7"
        >
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="font-display text-3xl font-bold text-flow-lime sm:text-4xl">
                <Counter value={value} suffix="+" />
              </p>
              <p className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-white/50 sm:text-xs">
                {label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
