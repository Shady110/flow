'use client'
import { motion } from 'framer-motion'
import { Category, getAllImagesFromCategory } from '@/data/portfolioData'

interface Props {
  categories: Category[]
  activeId: string
  onChange: (id: string) => void
}

export default function CategoryTabs({ categories, activeId, onChange }: Props) {
  const allCount = categories.reduce(
    (acc, c) => acc + getAllImagesFromCategory(c).length,
    0
  )

  const tabs = [
    { id: 'all', name: 'All', count: allCount },
    ...categories.map(c => ({
      id: c.id,
      name: c.name,
      count: getAllImagesFromCategory(c).length,
    })),
  ]

  return (
    <div className="flex gap-1 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map(tab => {
        const isActive = tab.id === activeId
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors"
            style={{ color: isActive ? 'white' : undefined }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-flow-green rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <span className={`relative z-10 ${isActive ? 'text-white font-semibold' : 'text-flow-text-muted hover:text-flow-green'}`}>
              {tab.name}
              <span className="ml-1 text-xs opacity-60">({tab.count})</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
