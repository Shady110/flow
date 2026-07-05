'use client'
import { motion } from 'framer-motion'

interface Props {
  totalImages: number
  totalCategories: number
}

const stats = (total: number, cats: number) => [
  { value: total, label: 'Photos' },
  { value: cats, label: 'Categories' },
  { value: 6, label: 'Platforms' },
]

export default function PortfolioHero({ totalImages, totalCategories }: Props) {
  return (
    <section className="pt-36 md:pt-40 pb-14 text-center grain-overlay bg-flow-bg relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'var(--gradient-hero-mesh)' }}
      />
      <div className="relative max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="eyebrow-label mb-6">Our Work</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-5xl md:text-6xl font-bold text-flow-green leading-tight mb-5"
        >
          Work That Sells.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-flow-text-muted text-lg leading-relaxed mb-12"
        >
          Browse our product photography, listing content, and
          marketplace-ready visuals.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center gap-12"
        >
          {stats(totalImages, totalCategories).map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="font-display text-4xl font-bold text-flow-green">
                {value}+
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-flow-text-muted mt-1">
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
