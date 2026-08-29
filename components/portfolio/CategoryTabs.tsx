'use client'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { spring } from '@/lib/animations'
import { Category, getAllImagesFromCategory } from '@/data/portfolioData'

interface Props {
  categories: Category[]
  activeId: string
  onChange: (id: string) => void
}

export default function CategoryTabs({ categories, activeId, onChange }: Props) {
  const t = useTranslations('marketing.portfolio')
  const allCount = categories.reduce((acc, c) => acc + getAllImagesFromCategory(c).length, 0)

  const tabs = [
    { id: 'all', name: t('all'), count: allCount },
    ...categories.map((c) => ({
      id: c.id,
      name: c.name,
      count: getAllImagesFromCategory(c).length,
    })),
  ]

  return (
    /* The row scrolls horizontally when it overflows; edge masks fade the
       overflowing tabs out instead of cutting them against a hard edge, so it
       is visible that there is more to reach. */
    <div
      role="tablist"
      aria-label={t('pageEyebrow')}
      className="flex snap-x snap-mandatory gap-1 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{
        maskImage:
          'linear-gradient(to right, transparent 0, black 1.5rem, black calc(100% - 1.5rem), transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0, black 1.5rem, black calc(100% - 1.5rem), transparent 100%)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId
        return (
          <motion.button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            whileTap={{ scale: 0.96 }}
            transition={spring.snappy}
            className="relative shrink-0 snap-start rounded-full px-5 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-green"
          >
            {isActive && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 rounded-full bg-flow-green"
                transition={spring.snappy}
              />
            )}
            <span
              className={`relative z-10 ${
                isActive ? 'font-semibold text-white' : 'text-flow-text-muted hover:text-flow-green'
              }`}
            >
              {tab.name}
              <span className="ms-1 text-xs opacity-60">({tab.count})</span>
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
