'use client'
import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/animations'
import { services } from '@/data/services'

export default function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-flow-bg-muted">
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
            What We Do
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-flow-green mt-4 mb-4">
            Four core services. One seamless flow.
          </h2>
        </motion.div>

        <div className="space-y-4">
          {/* Row 1 — 3 equal cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.slice(0, 3).map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  custom={i + 1}
                  className="bg-white rounded-2xl border-t-4 border-flow-green p-8 hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-flow-lime flex items-center justify-center mb-5">
                    <Icon size={20} className="text-flow-green" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-flow-green mb-3">
                    {s.title}
                  </h3>
                  <p className="text-flow-text-muted text-sm leading-relaxed mb-6">
                    {s.description}
                  </p>
                  <ul className="space-y-2">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-flow-text-muted">
                        <span className="text-flow-lime mt-0.5 font-bold shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </div>

          {/* Row 2 — Account Management full-width featured card */}
          {(() => {
            const s = services[3]
            const Icon = s.icon
            return (
              <motion.div
                key={s.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                custom={4}
                className="bg-[#FAFFF5] rounded-2xl border-t-4 border-flow-green border-l-4 border-l-flow-lime p-8 hover:scale-[1.01] hover:shadow-lg transition-all duration-300 relative"
              >
                <span className="absolute top-4 right-4 bg-flow-lime text-flow-green text-xs font-semibold px-3 py-1 rounded-full">
                  Full Service
                </span>
                <div className="flex flex-col md:flex-row md:gap-12">
                  {/* Left — icon, title, description */}
                  <div className="md:w-[40%] mb-6 md:mb-0">
                    <div className="w-12 h-12 rounded-full bg-flow-lime flex items-center justify-center mb-5">
                      <Icon size={20} className="text-flow-green" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-flow-green mb-3">
                      {s.title}
                    </h3>
                    <p className="text-flow-text-muted text-sm leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                  {/* Right — features in 2-col grid */}
                  <div className="md:w-[60%]">
                    <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
                      {s.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-flow-text-muted">
                          <span className="text-flow-lime mt-0.5 font-bold shrink-0">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )
          })()}
        </div>
      </div>
    </section>
  )
}

ServicesSection.displayName = 'ServicesSection'
