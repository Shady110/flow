'use client'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, TrendingDown, Package } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

const problems = [
  {
    icon: AlertTriangle,
    title: 'Technical Complexity',
    description:
      'Every platform has different rules for images, titles, metadata, and SEO.',
  },
  {
    icon: Clock,
    title: 'Time-Consuming Workflows',
    description:
      "Photography, descriptions, uploads — it all adds up to hours you don't have.",
  },
  {
    icon: TrendingDown,
    title: 'Poor Listing Performance',
    description:
      'Unoptimized listings miss search traffic and fail to convert browsers into buyers.',
  },
  {
    icon: Package,
    title: 'Scaling Challenges',
    description:
      'More products means more chaos — without a system, growth becomes painful.',
  },
]

export default function ProblemSection() {
  return (
    <section className="py-24 bg-flow-bg-soft">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          custom={0}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-flow-lime bg-flow-green px-3 py-1 rounded-full inline-block mb-4">
            The Problem
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-flow-green mt-4 mb-4">
            Selling online is harder than it looks.
          </h2>
          <p className="text-flow-text-muted text-base leading-relaxed max-w-2xl mx-auto">
            Most sellers lose time and revenue because marketplace management is
            complex, repetitive, and easy to get wrong.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((p, i) => {
            const Icon = p.icon
            return (
              <motion.div
                key={p.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                custom={i + 1}
                className="bg-white rounded-2xl border border-flow-border p-8 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-flow-lime flex items-center justify-center mb-5">
                  <Icon size={20} className="text-flow-green" />
                </div>
                <h3 className="font-display text-lg font-bold text-flow-green mb-2">
                  {p.title}
                </h3>
                <p className="text-flow-text-muted text-sm leading-relaxed">
                  {p.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
