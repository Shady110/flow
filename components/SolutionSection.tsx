'use client'
import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/animations'

const pipelineSteps = [
  { num: '①', label: 'Product' },
  { num: '②', label: 'Content Creation' },
  { num: '③', label: 'Listing Optimization' },
  { num: '④', label: 'Marketplace Publishing' },
  { num: '⑤', label: 'Account Management' },
  { num: '⑥', label: 'Sales Growth', final: true },
]

const chips = ['AI-Assisted Workflows', 'Human Expertise', 'End-to-End Service']

export default function SolutionSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={0}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-flow-lime bg-flow-green px-3 py-1 rounded-full inline-block mb-4">
              The Solution
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={1}
            className="font-display text-4xl md:text-5xl font-bold text-flow-green mt-4 mb-6 leading-tight"
          >
            One partner. The entire pipeline.
          </motion.h2>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={2}
            className="text-flow-text-muted text-base leading-relaxed mb-8"
          >
            FLOW combines AI-assisted workflows with human expertise to manage
            everything from product photography to marketplace publishing. You
            hand us the product — we handle the rest.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={3}
            className="flex flex-wrap gap-3"
          >
            {chips.map((chip) => (
              <span
                key={chip}
                className="text-xs font-semibold px-4 py-2 rounded-full bg-flow-bg-muted text-flow-green border border-flow-border"
              >
                {chip}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right — Pipeline card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          custom={2}
          className="flex justify-center lg:justify-end"
        >
          <div className="bg-white border border-flow-border rounded-2xl shadow-xl p-8 w-full max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-flow-text-muted mb-6">
              The FLOW Pipeline
            </p>
            {pipelineSteps.map((step, i) => (
              <div key={step.label} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-flow-lime flex items-center justify-center text-flow-green font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <div
                      className="w-px border-l-2 border-dashed border-flow-border my-1"
                      style={{ minHeight: 28 }}
                    />
                  )}
                </div>
                <div className="pb-5 flex items-center gap-2">
                  <p
                    className={`text-sm font-semibold ${
                      step.final ? 'text-flow-green' : 'text-flow-text'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.final && (
                    <span className="text-xs bg-flow-lime text-flow-green px-2 py-0.5 rounded-full font-bold">
                      ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
