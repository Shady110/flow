'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { staggerContainer, revealUp } from '@/lib/animations'

interface PipelineFlowProps {
  steps: string[]
  className?: string
}

export default function PipelineFlow({ steps, className = '' }: PipelineFlowProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'start 0.35'] })
  const lineScaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

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
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs mb-3 shrink-0 ${
                    isLast ? 'bg-flow-lime text-flow-green' : 'bg-flow-green text-white'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <p className={`text-xs font-semibold leading-tight ${isLast ? 'text-flow-green' : 'text-flow-text'}`}>
                  {step}
                </p>
              </motion.div>

              {!isLast && (
                <div className="flex-1 relative mt-5 mx-1">
                  <div className="absolute inset-x-0 top-0 border-t-2 border-dashed border-flow-border" />
                  <motion.div
                    className="absolute inset-x-0 top-0 h-0.5 bg-flow-green origin-left"
                    style={{ scaleX: lineScaleX }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: simplified vertical stack — kept distinct from Hero's PipelineCard */}
      <div className="md:hidden flex flex-col gap-4">
        {steps.map((step, i) => (
          <motion.div key={step} variants={revealUp} className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-flow-green text-white flex items-center justify-center font-bold text-xs shrink-0">
              {String(i + 1).padStart(2, '0')}
            </div>
            <p className="text-sm font-semibold text-flow-text">{step}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
