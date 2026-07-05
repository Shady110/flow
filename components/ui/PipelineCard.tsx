'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { staggerContainer, revealUp } from '@/lib/animations'
import { useReducedMotion } from '@/lib/useReducedMotion'

interface PipelineCardProps {
  steps: string[]
  title?: string
  floating?: boolean
  className?: string
}

export default function PipelineCard({
  steps,
  title = 'The FLOW Pipeline',
  floating = false,
  className = '',
}: PipelineCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'start 0.35'] })
  const lineProgress = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <motion.div
      animate={
        floating && !reduced
          ? { y: [0, -8, 0] }
          : { y: 0 }
      }
      transition={
        floating && !reduced
          ? { duration: 5, repeat: Infinity, ease: 'easeInOut' }
          : undefined
      }
      whileHover={{ y: -6 }}
      className={className}
    >
      <motion.div
        ref={ref}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="glass-card relative p-8 w-full max-w-sm"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-flow-text-muted mb-6">
          {title}
        </p>

        <div className="relative">
          {/* Static dashed guide line */}
          <div
            className="absolute left-[17px] top-1 border-l-2 border-dashed border-flow-border"
            style={{ bottom: 28 }}
          />
          {/* Scroll-linked fill line */}
          <motion.div
            className="absolute left-[17px] top-1 w-0.5 bg-flow-green origin-top"
            style={{ bottom: 28, scaleY: lineProgress }}
          />

          {steps.map((step, i) => {
            const isLast = i === steps.length - 1
            return (
              <motion.div
                key={step}
                variants={revealUp}
                className="relative z-10 flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-full bg-flow-lime flex items-center justify-center text-flow-green font-bold text-xs shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="pb-6 flex items-center gap-2">
                  <p
                    className={`text-sm font-semibold ${
                      isLast ? 'text-flow-green' : 'text-flow-text'
                    }`}
                  >
                    {step}
                  </p>
                  {isLast && (
                    <span className="text-xs bg-flow-lime text-flow-green px-2 py-0.5 rounded-full font-bold">
                      ✓
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
