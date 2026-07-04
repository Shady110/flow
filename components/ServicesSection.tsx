'use client'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, revealUp } from '@/lib/animations'
import { services } from '@/data/services'
import RevealHeading from './ui/RevealHeading'

export default function ServicesSection() {
  const [tall, stackedA, stackedB, featured] = services

  return (
    <section id="services" className="section-padding bg-flow-bg-muted">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          custom={0}
          className="flex flex-col items-center text-center mb-16"
        >
          <span className="eyebrow-index mb-6" data-index="03">What We Do</span>
          <RevealHeading
            text="Four core services. One seamless flow."
            accent={['seamless']}
            className="section-title mt-6 mb-4"
          />
        </motion.div>

        {/* Single bento grid — collapses the old "3 cards + separate featured banner" into one composition */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          style={{ gridTemplateRows: 'auto auto' }}
        >
          {/* Tall tile — services[0] */}
          <motion.div
            variants={revealUp}
            className="surface-elevated relative overflow-hidden p-8 md:col-start-1 md:col-span-1 md:row-start-1 md:row-span-2"
          >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundImage: 'var(--gradient-brand)' }} />
            <motion.div
              initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
              whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              className="w-12 h-12 rounded-full bg-flow-lime flex items-center justify-center mb-5"
            >
              <tall.icon size={20} className="text-flow-green" />
            </motion.div>
            <h3 className="font-display text-xl font-bold text-flow-green mb-3">{tall.title}</h3>
            <p className="text-flow-text-muted text-sm leading-relaxed mb-6">{tall.description}</p>
            <ul className="space-y-2">
              {tall.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-flow-text-muted">
                  <span className="text-flow-lime mt-0.5 font-bold shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Stacked pair — services[1], services[2] */}
          {[stackedA, stackedB].map((s, i) => (
            <motion.div
              key={s.title}
              variants={revealUp}
              className={`surface-elevated relative overflow-hidden p-6 md:col-start-2 md:col-span-1 ${
                i === 0 ? 'md:row-start-1' : 'md:row-start-2'
              } md:row-span-1`}
            >
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundImage: 'var(--gradient-brand)' }} />
              <motion.div
                initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
                whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                className="w-10 h-10 rounded-full bg-flow-lime flex items-center justify-center mb-4"
              >
                <s.icon size={18} className="text-flow-green" />
              </motion.div>
              <h3 className="font-display text-lg font-bold text-flow-green mb-2">{s.title}</h3>
              <p className="text-flow-text-muted text-sm leading-relaxed">{s.description}</p>
            </motion.div>
          ))}

          {/* Featured tile — services[3], Account Management */}
          <motion.div
            variants={revealUp}
            className="glass-card relative p-8 md:col-start-3 md:col-span-2 md:row-start-1 md:row-span-2"
            style={{ backgroundImage: 'var(--gradient-brand-soft)', boxShadow: 'var(--shadow-glow-lime)' }}
          >
            <span className="absolute top-4 right-4 bg-flow-lime text-flow-green text-xs font-semibold px-3 py-1 rounded-full">
              Full Service
            </span>
            <motion.div
              initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
              whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              className="w-12 h-12 rounded-full bg-flow-lime flex items-center justify-center mb-5"
            >
              <featured.icon size={20} className="text-flow-green" />
            </motion.div>
            <h3 className="font-display text-xl font-bold text-flow-green mb-3">{featured.title}</h3>
            <p className="text-flow-text-muted text-sm leading-relaxed mb-6 max-w-md">{featured.description}</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {featured.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-flow-text-muted">
                  <span className="text-flow-lime mt-0.5 font-bold shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

ServicesSection.displayName = 'ServicesSection'
