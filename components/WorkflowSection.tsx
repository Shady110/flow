'use client'
import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/animations'
import { workflowSteps } from '@/data/workflow'

export default function WorkflowSection() {
  return (
    <section id="workflow" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          custom={0}
          className="text-center mb-16"
        >
          <span className="eyebrow-label mb-4">
            How It Works
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-flow-green mt-4 mb-4">
            Your product. Our process. Marketplace success.
          </h2>
          <p className="text-flow-text-muted text-base leading-relaxed max-w-2xl mx-auto">
            A structured, repeatable workflow designed to get your products live
            faster and performing better.
          </p>
        </motion.div>

        {/* Desktop: horizontal timeline */}
        <div className="hidden md:grid grid-cols-6 gap-0 relative">
          <div className="absolute top-5.5 left-[8.33%] right-[8.33%] border-t-2 border-dashed border-flow-border z-0" />
          {workflowSteps.map((step, i) => (
            <motion.div
              key={step.num}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              custom={i}
              className="relative z-10 flex flex-col items-center text-center px-3"
            >
              <div className="w-11 h-11 rounded-full bg-flow-green flex items-center justify-center text-white font-bold text-sm mb-4 shrink-0">
                {step.num}
              </div>
              <p className="font-semibold text-flow-green text-sm mb-1">{step.title}</p>
              <p className="text-flow-text-muted text-xs leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Mobile: vertical */}
        <div className="flex flex-col md:hidden gap-0">
          {workflowSteps.map((step, i) => (
            <motion.div
              key={step.num}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              custom={i}
              className="flex gap-5"
            >
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-full bg-flow-green flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {step.num}
                </div>
                {i < workflowSteps.length - 1 && (
                  <div className="w-px flex-1 border-l-2 border-dashed border-flow-border my-1" style={{ minHeight: 32 }} />
                )}
              </div>
              <div className="pb-8 pt-1">
                <p className="font-semibold text-flow-green text-sm mb-1">{step.title}</p>
                <p className="text-flow-text-muted text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

WorkflowSection.displayName = 'WorkflowSection'
