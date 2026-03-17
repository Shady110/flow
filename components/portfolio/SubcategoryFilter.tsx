'use client'
import { motion } from 'framer-motion'
import { Subcategory } from '@/data/portfolioData'

interface Props {
  subcategories: Subcategory[]
  activeId: string
  onChange: (id: string) => void
}

export default function SubcategoryFilter({ subcategories, activeId, onChange }: Props) {
  const chips = [
    { id: 'all', name: 'All', count: subcategories.reduce((a, s) => a + s.images.length, 0) },
    ...subcategories.map(s => ({ id: s.id, name: s.name, count: s.images.length })),
  ]

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {chips.map((chip, i) => {
        const isActive = chip.id === activeId
        return (
          <motion.button
            key={chip.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            onClick={() => onChange(chip.id)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              isActive
                ? 'bg-flow-lime text-flow-green font-semibold border-flow-lime'
                : 'bg-white text-flow-text-muted border-flow-border hover:border-flow-green hover:text-flow-green'
            }`}
          >
            {chip.name}
            <span className="ml-1 text-xs opacity-60">({chip.count})</span>
          </motion.button>
        )
      })}
    </div>
  )
}
