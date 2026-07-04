'use client'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, scaleFadeIn } from '@/lib/animations'
import PipelineFlow from './ui/PipelineFlow'
import RevealHeading from './ui/RevealHeading'

const pipelineSteps = [
  'Product',
  'Content Creation',
  'Listing Optimization',
  'Marketplace Publishing',
  'Account Management',
  'Sales Growth',
]

const chips = ['AI-Assisted Workflows', 'Human Expertise', 'End-to-End Service']

export default function SolutionSection() {
  return (
    <section
      className="section-padding bg-flow-bg relative"
      style={{ backgroundImage: 'var(--gradient-brand-soft)', backgroundSize: '100% 100%' }}
    >
      <div className="absolute inset-0 bg-flow-bg/80" />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Text block spans full width on top, no more 50/50 split */}
        <div className="max-w-2xl mb-20">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={0}
          >
            <span className="eyebrow-index mb-6" data-index="02">The Solution</span>
          </motion.div>

          <RevealHeading
            text="One partner. The entire pipeline."
            accent={['pipeline.']}
            className="section-title mt-6 mb-6"
          />

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
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="flex flex-wrap gap-3"
          >
            {chips.map((chip) => (
              <motion.span
                key={chip}
                variants={scaleFadeIn}
                className="text-xs font-semibold px-4 py-2 rounded-full bg-flow-bg-muted text-flow-green border border-flow-border"
              >
                {chip}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Full-width horizontal pipeline flow */}
        <PipelineFlow steps={pipelineSteps} />
      </div>
    </section>
  )
}
