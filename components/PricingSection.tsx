'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { fadeUp, staggerContainer, revealUp } from '@/lib/animations'
import { cn } from '@/lib/utils'
import Counter from './ui/Counter'
import MagneticButton from './ui/MagneticButton'
import RevealHeading from './ui/RevealHeading'
import { pricingTabs, type PricingContent, type PricingPlan } from '@/data/landing-content'

function Price({ plan, featured }: { plan: PricingPlan; featured?: boolean }) {
  const color = featured ? 'text-white' : 'text-flow-green'
  if (plan.priceText) {
    return <span className={`font-display text-4xl font-bold ${color}`}>{plan.priceText}</span>
  }
  return (
    <span className={`font-display text-4xl font-bold ${color}`}>
      <Counter value={plan.priceValue ?? 0} suffix={plan.priceSuffix ?? ''} />
    </span>
  )
}

function Feature({ label, featured }: { label: string; featured?: boolean }) {
  return (
    <li className={cn('flex items-start gap-3 text-sm', featured ? 'text-white/85' : 'text-flow-text-muted')}>
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-flow-lime">
        <Check size={12} strokeWidth={3} className="text-flow-green" />
      </span>
      <span>{label}</span>
    </li>
  )
}

function PlanCard({ plan }: { plan: PricingPlan }) {
  const featured = !!plan.featured
  return (
    <motion.div
      variants={revealUp}
      className={cn(
        'relative flex h-full flex-col rounded-3xl p-8',
        featured
          ? 'text-white shadow-[var(--shadow-glow-lime)]'
          : 'border border-flow-border bg-white shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]',
      )}
      style={featured ? { backgroundImage: 'var(--gradient-dark-panel)' } : undefined}
    >
      {/* Header: plan name leads, kicker supports it, badge sits inline so it
          never overlaps. The name is what people compare — it goes first. */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              'font-display text-2xl font-bold leading-tight',
              featured ? 'text-flow-lime' : 'text-flow-green',
            )}
          >
            {plan.name}
          </p>
          <p
            className={cn(
              'mt-1 text-xs font-semibold uppercase tracking-widest',
              featured ? 'text-white/60' : 'text-flow-text-muted',
            )}
          >
            {plan.kicker}
          </p>
        </div>
        {plan.badge && (
          <span
            className={cn(
              'shrink-0 rounded-full px-3 py-1 text-xs font-bold',
              featured
                ? 'bg-flow-lime text-flow-green'
                : 'border border-flow-border bg-flow-bg-muted text-flow-green',
            )}
          >
            {plan.badge}
          </span>
        )}
      </div>

      <div className="mb-1">
        <Price plan={plan} featured={featured} />
      </div>
      <p className={cn('text-sm', featured ? 'text-white/60' : 'text-flow-text-muted')}>{plan.unit}</p>
      {plan.extraNote && (
        <p className={cn('mt-1 text-sm font-semibold', featured ? 'text-flow-lime' : 'text-flow-green')}>
          {plan.extraNote}
        </p>
      )}

      <ul className="mb-6 mt-6 space-y-3">
        {plan.features.map((f) => (
          <Feature key={f} label={f} featured={featured} />
        ))}
      </ul>

      {plan.bulk && (
        <div
          className={cn(
            'mb-6 rounded-2xl p-4',
            featured ? 'border border-white/10 bg-black/20' : 'border border-flow-border bg-flow-bg-soft',
          )}
        >
          <p className={cn('mb-3 text-xs font-bold uppercase tracking-wider', featured ? 'text-flow-lime' : 'text-flow-green')}>
            {plan.bulk.title}
          </p>
          <div className="space-y-2">
            {plan.bulk.rows.map((r) => (
              <div key={r.label} className="flex justify-between text-sm">
                <span className={featured ? 'text-white/70' : 'text-flow-text-muted'}>{r.label}</span>
                <span className={cn('font-semibold', featured ? 'text-white' : 'text-flow-green')}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What this plan saves against buying the same volume à la carte. */}
      {plan.savings && (
        <div
          className={cn(
            'mb-6 rounded-2xl px-4 py-3',
            featured ? 'bg-flow-lime text-flow-green' : 'border border-flow-green/20 bg-flow-lime/25',
          )}
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-flow-green">
              {plan.savings.label}
            </span>
            <span className="font-display text-lg font-bold text-flow-green">
              {plan.savings.amount}
            </span>
          </div>
          <p className="mt-0.5 text-xs font-medium text-flow-green/80">{plan.savings.percent}</p>
        </div>
      )}

      {plan.note && (
        <p className={cn('mb-6 text-xs italic', featured ? 'text-white/60' : 'text-flow-text-muted')}>{plan.note}</p>
      )}

      {/* CTA pinned to the bottom so every card lines up. The plan travels to the
          contact form as ?plan=… so the form preselects it and the lead lands
          tagged with the plan the visitor actually clicked. */}
      <div className="mt-auto pt-2">
        <MagneticButton strength={featured ? 0.25 : 0.15} className="block w-full">
          <Link
            href={plan.serviceKey ? `?plan=${plan.serviceKey}#contact` : '#contact'}
            className={cn(
              'block rounded-xl py-3.5 text-center text-sm font-semibold transition-colors',
              featured
                ? 'bg-flow-lime text-flow-green shadow-[var(--shadow-glow-lime)] hover:bg-flow-lime-hover'
                : 'border-2 border-flow-green text-flow-green hover:bg-flow-green hover:text-white',
            )}
          >
            {plan.cta}
          </Link>
        </MagneticButton>
      </div>
    </motion.div>
  )
}

export default function PricingSection({ content }: { content: PricingContent }) {
  const tabs = pricingTabs(content)
  // The monthly-plans tab is the one we want chosen, so it opens first even
  // though it sits last in the bar.
  const [activeId, setActiveId] = useState(
    () => tabs.find((t) => t.id === content.defaultTab)?.id ?? tabs[0]?.id,
  )
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0]
  const monthly = tabs.find((t) => t.id === content.defaultTab)

  if (!active) return null

  return (
    <section id="pricing" className="section-padding bg-flow-bg-soft">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          custom={0}
          className="flex flex-col items-center text-center mb-10"
        >
          <span className="eyebrow-index mb-6" data-index="04">{content.eyebrow}</span>
          <RevealHeading text={content.heading} accent={content.accent} className="section-title mt-6 mb-4" />
          <p className="text-flow-text-muted text-base leading-relaxed max-w-2xl mx-auto">{content.subheading}</p>
        </motion.div>

        {tabs.length > 1 && (
          <div className="mb-4 flex justify-center">
            <div
              role="tablist"
              aria-label={content.eyebrow}
              className="inline-flex w-full max-w-2xl flex-col gap-2 rounded-2xl border border-flow-border bg-white p-2 shadow-[var(--shadow-sm)] sm:flex-row"
            >
              {tabs.map((tab) => {
                const on = tab.id === active.id
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    type="button"
                    aria-selected={on}
                    onClick={() => setActiveId(tab.id)}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                      on
                        ? 'bg-flow-green text-white shadow-[var(--shadow-sm)]'
                        : 'text-flow-text-muted hover:bg-flow-bg-muted hover:text-flow-green',
                    )}
                  >
                    {tab.label}
                    {tab.badge && (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          on ? 'bg-flow-lime text-flow-green' : 'bg-flow-lime/40 text-flow-green',
                        )}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {active.tagline && (
          <p className="mx-auto mb-8 max-w-2xl text-center text-sm leading-relaxed text-flow-text-muted">
            {active.tagline}
          </p>
        )}

        {/* Uniform, scalable grid — every plan is an equal card; add/remove from
            the dashboard and the layout reflows. No scaled/overlapping cards.
            Re-keyed on the tab so the cards animate in on every switch. */}
        <motion.div
          key={active.id}
          role="tabpanel"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className={cn(
            'mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2',
            active.plans.length >= 3 ? 'lg:grid-cols-3' : 'max-w-4xl',
          )}
        >
          {active.plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </motion.div>

        {active.footnote && (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-flow-text-muted">{active.footnote}</p>
            {monthly && monthly.id !== active.id && (
              <button
                type="button"
                onClick={() => setActiveId(monthly.id)}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-flow-green px-5 py-2.5 text-sm font-semibold text-flow-green transition-colors hover:bg-flow-green hover:text-white"
              >
                {monthly.label}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

PricingSection.displayName = 'PricingSection'
