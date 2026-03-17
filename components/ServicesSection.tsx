'use client'
import { motion } from 'framer-motion'
import { Camera, BarChart2, Store } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

const services = [
  {
    icon: Camera,
    title: 'Product Content Creation',
    description:
      'We create professional product content built for marketplace success — from studio photography to SEO-optimized titles and bilingual descriptions.',
    features: [
      'Studio photography on white background',
      'Professional retouching & editing',
      '3–5 high-resolution photos',
      'Bilingual descriptions (Arabic + English)',
      'SEO-optimized titles & keywords',
    ],
  },
  {
    icon: BarChart2,
    title: 'Listing Optimization',
    description:
      'We ensure your listings rank higher and convert better across all major e-commerce platforms.',
    features: [
      'Marketplace SEO & keyword strategy',
      'Platform-compliant formatting',
      'Category structure optimization',
      'Conversion-focused copy',
      'Listing compliance review',
    ],
  },
  {
    icon: Store,
    title: 'Marketplace Management',
    description:
      'We manage your seller accounts and product catalog so you can focus on sourcing and scaling.',
    features: [
      'Listing uploads & catalog management',
      'Product updates & maintenance',
      'Multi-platform support',
      'Marketplace compliance',
      'Dedicated account support',
    ],
  },
]

export default function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-flow-bg-muted">
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
            What We Do
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-flow-green mt-4 mb-4">
            Three core services. One seamless flow.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
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
      </div>
    </section>
  )
}
