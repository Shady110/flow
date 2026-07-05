'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'

export interface AccordionItem {
  question: string
  answer: string
}

interface AccordionProps {
  items: AccordionItem[]
  /** Index open by default (null = all closed). */
  defaultOpen?: number | null
}

export default function Accordion({ items, defaultOpen = 0 }: AccordionProps) {
  const [open, setOpen] = useState<number | null>(defaultOpen)

  return (
    <div className="divide-y divide-flow-border border-y border-flow-border">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.question}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-6 py-6 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-green focus-visible:ring-offset-2 rounded-lg"
            >
              <span className="font-display text-lg md:text-xl font-bold text-flow-green group-hover:text-flow-green-light transition-colors">
                {item.question}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  isOpen ? 'bg-flow-green text-flow-lime' : 'bg-flow-bg-muted text-flow-green'
                }`}
              >
                <Plus size={18} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="text-flow-text-muted text-base leading-relaxed pb-6 max-w-2xl">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
