'use client'
import { motion } from 'framer-motion'
import { staggerContainer, revealUp } from '@/lib/animations'
import { problems } from '@/data/problems'
import RevealHeading from './ui/RevealHeading'

export default function ProblemSection() {
  const [featured, ...rest] = problems

  return (
    <section className="section-padding bg-flow-bg-soft">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Off-center header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid md:grid-cols-12 gap-6 mb-12 items-end"
        >
          <div className="md:col-span-7">
            <span className="eyebrow-index mb-6" data-index="01">The Problem</span>
            <RevealHeading
              text="Selling online is harder than it looks."
              accent={['harder']}
              className="section-title mt-6"
            />
          </div>
          <div className="md:col-span-5">
            <p className="text-flow-text-muted text-base leading-relaxed md:text-right md:ml-auto md:max-w-sm">
              Most sellers lose time and revenue because marketplace management is
              complex, repetitive, and easy to get wrong.
            </p>
          </div>
        </motion.div>

        {/* Bento grid — one large tile + three smaller tiles */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-6"
        >
          <motion.div
            variants={revealUp}
            className="surface-elevated p-10 flex flex-col justify-between md:col-start-1 md:col-span-2 md:row-start-1 md:row-span-2"
          >
            <div>
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                className="w-14 h-14 rounded-full bg-flow-lime flex items-center justify-center mb-6"
              >
                <featured.icon size={24} className="text-flow-green" />
              </motion.div>
              <h3 className="font-display text-2xl font-bold text-flow-green mb-3">
                {featured.title}
              </h3>
              <p className="text-flow-text-muted text-base leading-relaxed max-w-md">
                {featured.description}
              </p>
            </div>
          </motion.div>

          {rest.map((p, i) => {
            const Icon = p.icon
            const positions = [
              'md:col-start-3 md:col-span-2 md:row-start-1 md:row-span-1',
              'md:col-start-3 md:col-span-1 md:row-start-2 md:row-span-1',
              'md:col-start-4 md:col-span-1 md:row-start-2 md:row-span-1',
            ]
            return (
              <motion.div
                key={p.title}
                variants={revealUp}
                className={`surface-elevated p-8 ${positions[i]}`}
              >
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                  className="w-12 h-12 rounded-full bg-flow-lime flex items-center justify-center mb-5"
                >
                  <Icon size={20} className="text-flow-green" />
                </motion.div>
                <h3 className="font-display text-lg font-bold text-flow-green mb-2">
                  {p.title}
                </h3>
                <p className="text-flow-text-muted text-sm leading-relaxed">
                  {p.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

ProblemSection.displayName = 'ProblemSection'
