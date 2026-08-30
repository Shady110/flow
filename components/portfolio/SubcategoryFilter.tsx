'use client'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { spring } from '@/lib/animations'
import { Subcategory } from '@/data/portfolioData'

interface Props {
  subcategories: Subcategory[]
  activeId: string
  onChange: (id: string) => void
}

export default function SubcategoryFilter({ subcategories, activeId, onChange }: Props) {
  const t = useTranslations('marketing.portfolio')
  const chips = [
    { id: 'all', name: t('all'), count: subcategories.reduce((a, s) => a + s.images.length, 0) },
    ...subcategories.map((s) => ({ id: s.id, name: s.name, count: s.images.length })),
  ]

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {chips.map((chip, i) => {
        const isActive = chip.id === activeId
        return (
          <motion.button
            key={chip.id}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.96 }}
            transition={{ ...spring.snappy, delay: i * 0.03 }}
            onClick={() => onChange(chip.id)}
            aria-pressed={isActive}
            className="relative rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-green"
            style={{
              borderColor: isActive ? 'var(--color-flow-lime)' : 'var(--color-flow-border)',
            }}
          >
            {isActive && (
              <motion.span
                layoutId="activeChipBg"
                transition={spring.snappy}
                className="absolute inset-0 rounded-full bg-flow-lime"
              />
            )}
            <span
              className={`relative z-10 ${
                isActive
                  ? 'font-semibold text-flow-green'
                  : 'text-flow-text-muted hover:text-flow-green'
              }`}
            >
              {chip.name}
              <span className="ms-1 text-xs opacity-60">({chip.count})</span>
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
