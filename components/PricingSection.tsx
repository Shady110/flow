'use client'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { fadeUp } from '@/lib/animations'
import Counter from './ui/Counter'
import MagneticButton from './ui/MagneticButton'
import RevealHeading from './ui/RevealHeading'
import type { PricingContent, PricingPlan } from '@/data/landing-content'

function Price({ plan, dark }: { plan: PricingPlan; dark?: boolean }) {
  const color = dark ? 'text-white' : 'text-flow-green'
  if (plan.priceText) {
    return <span className={`font-display text-4xl font-bold ${color}`}>{plan.priceText}</span>
  }
  return (
    <span className={`font-display text-4xl font-bold ${color}`}>
      <Counter value={plan.priceValue ?? 0} suffix={plan.priceSuffix ?? ''} />
    </span>
  )
}

function Feature({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <li className={`flex items-start gap-2 text-sm ${dark ? 'text-white/80' : 'text-flow-text-muted'}`}>
      <Check size={14} className={`${dark ? 'text-flow-lime' : 'text-flow-green'} mt-0.5 shrink-0`} />
      {label}
    </li>
  )
}

export default function PricingSection({ content }: { content: PricingContent }) {
  const plans = content.plans

  return (
    <section id="pricing" className="section-padding bg-flow-bg-soft">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          custom={0}
          className="flex flex-col items-center text-center mb-12"
        >
          <span className="eyebrow-index mb-6" data-index="06">{content.eyebrow}</span>
          <RevealHeading
            text={content.heading}
            accent={content.accent}
            className="section-title mt-6 mb-4"
          />
          <p className="text-flow-text-muted text-base leading-relaxed max-w-2xl mx-auto">
            {content.subheading}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:items-center">
          {plans.map((plan, i) => {
            const featured = i === 2
            const fullWidth = i === plans.length - 1

            if (featured) {
              return (
                <motion.div
                  key={plan.name}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  custom={i + 1}
                  className="glass-card-dark p-8 lg:p-10 flex flex-col relative z-10 md:col-span-2 lg:col-span-1 lg:-my-6 lg:scale-105 origin-center"
                  style={{ backgroundImage: 'var(--gradient-dark-panel)', boxShadow: 'var(--shadow-glow-lime)' }}
                >
                  {plan.badge && (
                    <span className="absolute top-4 right-4 rtl:right-auto rtl:left-4 bg-flow-lime text-flow-green text-xs font-bold px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-4">{plan.kicker}</p>
                  <div className="mb-1"><Price plan={plan} dark /></div>
                  <p className="text-sm text-white/60 mb-6">{plan.unit}</p>
                  <p className="font-semibold text-flow-lime text-base mb-4">{plan.name}</p>
                  <ul className="space-y-3 flex-1 mb-6">
                    {plan.features.map((f) => <Feature key={f} label={f} dark />)}
                  </ul>

                  {plan.bulk && (
                    <div className="rounded-xl p-4 mb-6 bg-black/20 border border-white/10">
                      <p className="text-xs font-bold text-flow-lime uppercase tracking-wider mb-3">{plan.bulk.title}</p>
                      <div className="space-y-2">
                        {plan.bulk.rows.map((r) => (
                          <div key={r.label} className="flex justify-between text-sm">
                            <span className="text-white/70">{r.label}</span>
                            <span className="text-white font-semibold">{r.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <MagneticButton className="block w-full">
                    <a
                      href="#contact"
                      className="block text-center bg-flow-lime text-flow-green font-bold py-3.5 rounded-xl hover:bg-flow-lime-hover transition-colors text-sm shadow-[var(--shadow-glow-lime)]"
                    >
                      {plan.cta}
                    </a>
                  </MagneticButton>
                </motion.div>
              )
            }

            if (fullWidth) {
              return (
                <motion.div
                  key={plan.name}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  custom={i + 1}
                  className="col-span-1 md:col-span-2 lg:col-span-3 surface-elevated p-8 relative"
                >
                  <div className="flex flex-col md:flex-row md:gap-12 md:items-center">
                    <div className="md:w-[35%] mb-8 md:mb-0">
                      <p className="text-xs font-semibold uppercase tracking-widest text-flow-text-muted mb-4">{plan.kicker}</p>
                      <div className="mb-1"><Price plan={plan} /></div>
                      <p className="text-sm text-flow-text-muted mb-1">{plan.unit}</p>
                      {plan.extraNote && <p className="text-sm font-semibold text-flow-green mb-6">{plan.extraNote}</p>}
                      <p className="font-semibold text-flow-green text-base mb-6">{plan.name}</p>
                    </div>
                    <div className="md:w-[65%] flex flex-col gap-6">
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        {plan.features.map((f) => <Feature key={f} label={f} />)}
                      </ul>
                      <a
                        href="#contact"
                        className="inline-block text-center border-2 border-flow-green text-flow-green font-semibold py-3 px-8 rounded-xl hover:bg-flow-green hover:text-white transition-colors text-sm self-start"
                      >
                        {plan.cta}
                      </a>
                    </div>
                  </div>
                </motion.div>
              )
            }

            return (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                custom={i + 1}
                className="surface-elevated p-8 flex flex-col relative"
              >
                {plan.badge && (
                  <span className="absolute top-4 right-4 rtl:right-auto rtl:left-4 bg-flow-bg-muted text-flow-green text-xs font-bold px-3 py-1 rounded-full border border-flow-border">
                    {plan.badge}
                  </span>
                )}
                <p className="text-xs font-semibold uppercase tracking-widest text-flow-text-muted mb-4">{plan.kicker}</p>
                <div className="mb-1"><Price plan={plan} /></div>
                <p className="text-sm text-flow-text-muted mb-6">{plan.unit}</p>
                <p className="font-semibold text-flow-green text-base mb-4">{plan.name}</p>
                <ul className="space-y-3 flex-1 mb-4">
                  {plan.features.map((f) => <Feature key={f} label={f} />)}
                </ul>
                {plan.note && <p className="text-xs text-flow-text-muted italic mb-6">{plan.note}</p>}
                <a
                  href="#contact"
                  className="block text-center border-2 border-flow-green text-flow-green font-semibold py-3 rounded-xl hover:bg-flow-green hover:text-white transition-colors text-sm mt-auto"
                >
                  {plan.cta}
                </a>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

PricingSection.displayName = 'PricingSection'
