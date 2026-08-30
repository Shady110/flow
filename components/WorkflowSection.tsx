'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { spring } from '@/lib/animations'
import { cn } from '@/lib/utils'
import RevealHeading from './ui/RevealHeading'
import Reveal from './ui/Reveal'
import { ProcessArt } from './ui/illustrations'

const stepKeys = ['s1', 's2', 's3', 's4', 's5', 's6'] as const

/**
 * The process, as a column of expandable step cards beside a fixed visual.
 *
 * This replaced a 260vh pinned section that scrubbed the steps against scroll.
 * That version looked impressive and behaved badly: it took over the scroll for
 * two and a half screens, could not be skimmed, gave a reader no way to go
 * straight to a step, and needed an entirely separate DOM branch for mobile.
 * Steps you can click through are the same information under the reader's
 * control, in a third of the code and with one layout for every screen.
 */
export default function WorkflowSection() {
  const t = useTranslations('marketing.workflow')
  const steps = stepKeys.map((key, i) => ({
    num: String(i + 1).padStart(2, '0'),
    title: t(`steps.${key}.title`),
    description: t(`steps.${key}.description`),
  }))
  const [open, setOpen] = useState(0)

  return (
    <section id="workflow" className="section-padding bg-flow-bg">
      <div className="section-container">
        <div className="flex flex-col items-center text-center">
          <Reveal y={16}>
            <span className="eyebrow-index text-flow-text-muted" data-index="05">
              {t('eyebrow')}
            </span>
          </Reveal>
          <RevealHeading text={t('heading')} className="section-title mt-6 max-w-3xl" />
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-flow-text-muted">
              {t('intro')}
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Steps */}
          <div className="relative">
            {/* The rail runs behind the markers, inset by half a marker so it
                meets their centres. Logical inset so it mirrors in Arabic. */}
            <div
              aria-hidden="true"
              className="absolute bottom-6 start-[19px] top-6 border-s-2 border-dashed border-flow-border"
            />
            <ul className="relative space-y-3">
              {steps.map((s, i) => {
                const isOpen = i === open
                return (
                  <Reveal as="li" key={s.num} delay={i * 0.05} y={18}>
                    <motion.button
                      type="button"
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      whileTap={{ scale: 0.995 }}
                      transition={spring.snappy}
                      className={cn(
                        'flex w-full gap-4 rounded-2xl border p-4 text-start transition-colors sm:p-5',
                        isOpen
                          ? 'border-flow-green/20 bg-white shadow-[var(--shadow-md)]'
                          : 'border-flow-border bg-flow-bg-soft hover:border-flow-green/20',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold transition-colors',
                          isOpen
                            ? 'bg-flow-green text-flow-lime'
                            : 'bg-white text-flow-green ring-1 ring-flow-border',
                        )}
                      >
                        {s.num}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-flow-text-muted">
                          {t('stepLabel')} {s.num}
                        </span>
                        <span className="mt-1 block font-display text-lg font-bold text-flow-green">
                          {s.title}
                        </span>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.span
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={spring.ui}
                              className="block overflow-hidden"
                            >
                              <span className="mt-2 block text-sm leading-relaxed text-flow-text-muted">
                                {s.description}
                              </span>
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>

                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={spring.snappy}
                        className="mt-0.5 shrink-0 text-flow-green/50"
                      >
                        <Plus size={16} />
                      </motion.span>
                    </motion.button>
                  </Reveal>
                )
              })}
            </ul>
          </div>

          {/* Visual, held in view while the steps are read through. */}
          <Reveal delay={0.1} y={24} className="lg:sticky lg:top-28 lg:self-start">
            <div
              className="rounded-3xl border border-white/10 p-6 shadow-[var(--shadow-xl)] sm:p-8"
              style={{ backgroundImage: 'var(--gradient-dark-panel)' }}
            >
              <ProcessArt />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

WorkflowSection.displayName = 'WorkflowSection'
