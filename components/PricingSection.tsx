'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, SlidersHorizontal } from 'lucide-react'
import { spring, staggerContainer, revealUp } from '@/lib/animations'
import { cn } from '@/lib/utils'
import Counter from './ui/Counter'
import MagneticButton from './ui/MagneticButton'
import RevealHeading from './ui/RevealHeading'
import Reveal from './ui/Reveal'
import { useTranslations } from 'next-intl'
import { pricingTabs, type PricingContent, type PricingPlan } from '@/data/landing-content'
import PackageBuilderSection from './PackageBuilderSection'

/**
 * The builder rides in as a fourth tab rather than a separate section below the
 * plans: someone deciding none of the three packages fits them is already
 * looking at the tab bar, so that is where the alternative belongs.
 *
 * Its id cannot collide with a tab id from the editable landing blob.
 */
const CUSTOM_TAB = '__custom__'

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

      {/* Discount framing: what the same volume costs à la carte, struck out.
          The strike is an inline style, not the `line-through` utility — a
          missing utility silently renders the old price as if it were current,
          which misprices the plan. Too important to depend on CSS delivery. */}
      {plan.compareAt && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            style={{
              textDecorationLine: 'line-through',
              textDecorationThickness: '2px',
              textDecorationColor: featured ? 'rgba(255,255,255,0.55)' : 'var(--color-flow-text-muted)',
            }}
            className={cn(
              'text-base font-semibold',
              featured ? 'text-white/50' : 'text-flow-text-muted',
            )}
          >
            {plan.compareAt.price}
          </span>
          <span className="rounded-full bg-flow-lime px-3 py-1 text-xs font-bold leading-none text-flow-green">
            {plan.compareAt.discount}
          </span>
        </div>
      )}

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

      {plan.note && (
        <p className={cn('mb-6 text-xs italic', featured ? 'text-white/60' : 'text-flow-text-muted')}>{plan.note}</p>
      )}

      {/* CTA pinned to the bottom so every card lines up. The plan travels to the
          contact form as ?plan=… so the form preselects it and the lead lands
          tagged with the plan the visitor actually clicked. The link is relative
          on purpose: every page that renders this section also renders a
          ContactSection, so the CTA scrolls down the current page instead of
          navigating away from the prices the visitor is still reading. */}
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

/**
 * Segmented control.
 *
 * The selected state used to be a background-colour class that simply moved
 * from one button to another — no continuity, so nothing connected the tab you
 * left to the tab you arrived at. A single shared `layoutId` pill physically
 * travels between them instead, and the label colours cross-fade over it.
 */
function Tab({
  active,
  onSelect,
  children,
}: {
  active: boolean
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    <motion.button
      role="tab"
      type="button"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      transition={spring.snappy}
      className={cn(
        'relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-200',
        active ? 'text-white' : 'text-flow-text-muted hover:text-flow-green',
      )}
    >
      {active && (
        <motion.span
          layoutId="pricing-tab-pill"
          transition={spring.snappy}
          className="absolute inset-0 rounded-xl bg-flow-green shadow-[var(--shadow-sm)]"
        />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  )
}

export default function PricingSection({ content }: { content: PricingContent }) {
  const tabs = pricingTabs(content)
  // The monthly-plans tab is the one we want chosen, so it opens first even
  // though it sits last in the bar.
  const [activeId, setActiveId] = useState(
    () => tabs.find((t) => t.id === content.defaultTab)?.id ?? tabs[0]?.id,
  )
  // Undefined on the custom tab: that one renders the builder in place of the
  // plan grid, so everything driven by a tab's plans is guarded on it.
  const active =
    activeId === CUSTOM_TAB ? undefined : (tabs.find((t) => t.id === activeId) ?? tabs[0])
  const monthly = tabs.find((t) => t.id === content.defaultTab)
  const tb = useTranslations('marketing.packageBuilder')
  const listRef = useRef<HTMLDivElement>(null)

  const allIds = [...tabs.map((t) => t.id), CUSTOM_TAB]

  // Roving arrow-key navigation, mirrored: in Arabic the left arrow moves to
  // the next tab, because the next tab is physically to the left.
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const rtl = document.documentElement.dir === 'rtl'
    const forward = rtl ? e.key === 'ArrowLeft' : e.key === 'ArrowRight'
    const i = allIds.indexOf(activeId ?? allIds[0])
    const next = allIds[(i + (forward ? 1 : -1) + allIds.length) % allIds.length]
    setActiveId(next)
    // Move focus with selection so the control stays keyboard-navigable.
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    buttons?.[allIds.indexOf(next)]?.focus()
  }

  return (
    <>
      {/* Establishing band. The page used to open straight onto a tab bar with
          no statement of what was being priced. */}
      <section
        className="relative overflow-hidden pb-16 pt-32 md:pb-20 md:pt-40"
        style={{ backgroundImage: 'var(--gradient-dark-panel)' }}
      >
        <div className="section-container">
          <Reveal y={16}>
            <span className="eyebrow-index text-flow-lime/80" data-index="01">
              {content.eyebrow}
            </span>
          </Reveal>
          <RevealHeading
            text={content.heading}
            accent={content.accent}
            accentTone="light"
            as="h1"
            whileInView={false}
            className="mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-white md:text-5xl lg:text-6xl"
          />
        </div>
      </section>

      <section id="pricing" className="section-padding bg-flow-bg-soft">
        <div className="section-container">
          {tabs.length > 0 && (
            <div className="mb-6">
              <div
                role="tablist"
                ref={listRef}
                onKeyDown={onKeyDown}
                aria-label={content.eyebrow}
                className="flex w-full flex-col gap-2 rounded-2xl border border-flow-border bg-white p-2 shadow-[var(--shadow-sm)] sm:flex-row"
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.id}
                    active={tab.id === active?.id}
                    onSelect={() => setActiveId(tab.id)}
                  >
                    {tab.label}
                    {tab.badge && (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          tab.id === active?.id
                            ? 'bg-flow-lime text-flow-green'
                            : 'bg-flow-lime/40 text-flow-green',
                        )}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </Tab>
                ))}
                <Tab
                  active={activeId === CUSTOM_TAB}
                  onSelect={() => setActiveId(CUSTOM_TAB)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {tb('tabLabel')}
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      activeId === CUSTOM_TAB
                        ? 'bg-flow-lime text-flow-green'
                        : 'bg-flow-lime/40 text-flow-green',
                    )}
                  >
                    {tb('tabBadge')}
                  </span>
                </Tab>
              </div>
            </div>
          )}

          {/* One presence boundary around the whole panel, so switching tabs
              reads as one surface being replaced rather than a stack of
              independently-timed pieces. `popLayout` pulls the outgoing panel
              out of flow, so the incoming one does not wait for it. */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={spring.ui}
            >
              {activeId === CUSTOM_TAB && <PackageBuilderSection embedded />}

              {active?.tagline && (
                <p className="mx-auto mb-8 max-w-2xl text-center text-sm leading-relaxed text-flow-text-muted">
                  {active.tagline}
                </p>
              )}

              {/* Uniform, scalable grid — every plan is an equal card; add/remove
                  from the dashboard and the layout reflows. */}
              {active && (
                <motion.div
                  role="tabpanel"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className={cn(
                    'mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2',
                    active.plans.length >= 3 ? 'lg:grid-cols-3' : 'max-w-4xl',
                  )}
                >
                  {active.plans.map((plan) => (
                    <PlanCard key={plan.name} plan={plan} />
                  ))}
                </motion.div>
              )}

              {active?.footnote && (
                <div className="mt-8 flex flex-col items-center gap-3 text-center">
                  <p className="text-sm text-flow-text-muted">{active.footnote}</p>
                  {monthly && monthly.id !== active.id && (
                    <motion.button
                      type="button"
                      onClick={() => setActiveId(monthly.id)}
                      whileTap={{ scale: 0.97 }}
                      transition={spring.snappy}
                      className="inline-flex items-center gap-1.5 rounded-full border-2 border-flow-green px-5 py-2.5 text-sm font-semibold text-flow-green transition-colors hover:bg-flow-green hover:text-white"
                    >
                      {monthly.label}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </>
  )
}

PricingSection.displayName = 'PricingSection'
