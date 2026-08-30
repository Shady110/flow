'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { staggerContainer, revealUp } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface PipelineFlowProps {
  steps: string[]
  /** Which ground it sits on. Dark inverts the ink and the node fills. */
  tone?: 'light' | 'dark'
  className?: string
}

export default function PipelineFlow({ steps, tone = 'light', className = '' }: PipelineFlowProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'start 0.35'] })
  const lineScaleX = useTransform(scrollYProgress, [0, 1], [0, 1])
  const dark = tone === 'dark'

  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={className}
    >
      {/* Desktop: horizontal flow */}
      <div className="hidden md:flex items-start">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1
          return (
            <div key={step} className="flex items-start flex-1 last:flex-none">
              <motion.div variants={revealUp} className="flex flex-col items-center text-center w-28 shrink-0">
                <div
                  className={cn(
                    'w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-xs mb-3 shrink-0',
                    isLast
                      ? 'bg-flow-lime text-flow-green'
                      : dark
                        ? 'bg-white/10 text-white ring-1 ring-white/15'
                        : 'bg-flow-green text-white',
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <p
                  className={cn(
                    'text-xs font-semibold leading-tight',
                    isLast
                      ? dark ? 'text-flow-lime' : 'text-flow-green'
                      : dark ? 'text-white/70' : 'text-flow-text',
                  )}
                >
                  {step}
                </p>
              </motion.div>

              {!isLast && (
                <div className="flex-1 relative mt-5 mx-1">
                  <div
                    className={cn(
                      'absolute inset-x-0 top-0 border-t-2 border-dashed',
                      dark ? 'border-white/15' : 'border-flow-border',
                    )}
                  />
                  {/* The drawn line grows from the start edge — which is the
                      right edge in Arabic, not the left. */}
                  <motion.div
                    className={cn(
                      'absolute inset-x-0 top-0 h-0.5 origin-left rtl:origin-right',
                      dark ? 'bg-flow-lime' : 'bg-flow-green',
                    )}
                    style={{ scaleX: lineScaleX }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: simplified vertical stack */}
      <div className="md:hidden flex flex-col gap-4">
        {steps.map((step, i) => (
          <motion.div key={step} variants={revealUp} className="flex items-center gap-4">
            <div
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0',
                dark ? 'bg-white/10 text-white ring-1 ring-white/15' : 'bg-flow-green text-white',
              )}
            >
              {String(i + 1).padStart(2, '0')}
            </div>
            <p className={cn('text-sm font-semibold', dark ? 'text-white/80' : 'text-flow-text')}>
              {step}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
