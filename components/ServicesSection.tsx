'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { spring } from '@/lib/animations'
import { cn } from '@/lib/utils'
import { services } from '@/data/services'
import RevealHeading from './ui/RevealHeading'
import Reveal from './ui/Reveal'
import MagneticButton from './ui/MagneticButton'
import {
  ContentCreationArt,
  ListingOptimizationArt,
  MarketplaceArt,
  AccountManagementArt,
} from './ui/illustrations'
import type { ServicesContent } from '@/data/landing-content'

// Icons and artwork are structural, not translated — they pair with the
// localized copy by position, the same way the icons always have.
const icons = services.map((s) => s.icon)
const art = [ContentCreationArt, ListingOptimizationArt, MarketplaceArt, AccountManagementArt]

/**
 * Services as a switchable showcase: a tab per service, then one large dark
 * panel holding the illustration, the description and the capability rows.
 *
 * The previous register laid all four services out at once, which meant four
 * competing blocks of small text and no room to actually show anything. One
 * service at a time gets each the whole panel — and the tab bar makes the set
 * legible at a glance without scrolling through it.
 */
export default function ServicesSection({ content }: { content: ServicesContent }) {
  const items = content.items
  const [active, setActive] = useState(0)
  const current = items[active] ?? items[0]
  const Art = art[active] ?? art[0]

  if (!current) return null

  return (
    <section id="services" className="section-padding bg-flow-bg-soft">
      <div className="section-container">
        {/* Centred header, matching the reference's cadence for its
            switchable sections. */}
        <div className="flex flex-col items-center text-center">
          <Reveal y={16}>
            <span className="eyebrow-index text-flow-text-muted" data-index="03">
              {content.eyebrow}
            </span>
          </Reveal>
          <RevealHeading
            text={content.heading}
            accent={content.accent}
            className="section-title mt-6 max-w-3xl"
          />
        </div>

        {/* Tab bar. Scrolls rather than wraps on narrow screens, so the row
            never becomes a two-line block that shifts the panel down. */}
        <div
          role="tablist"
          aria-label={content.eyebrow}
          className="mt-10 flex justify-start gap-2 overflow-x-auto pb-2 md:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, i) => {
            const Icon = icons[i] ?? icons[0]
            const on = i === active
            return (
              <motion.button
                key={item.title}
                role="tab"
                aria-selected={on}
                onClick={() => setActive(i)}
                whileTap={{ scale: 0.97 }}
                transition={spring.snappy}
                className={cn(
                  'relative flex shrink-0 flex-col items-center gap-2 rounded-2xl px-5 py-3 text-center transition-colors',
                  on ? 'text-flow-green' : 'text-flow-text-muted hover:text-flow-green',
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                    on ? 'bg-flow-green text-flow-lime' : 'bg-white text-flow-green',
                  )}
                >
                  <Icon size={18} />
                </span>
                <span className="max-w-[7.5rem] text-xs font-semibold leading-tight">
                  {item.title}
                </span>
                {on && (
                  <motion.span
                    layoutId="services-tab-underline"
                    transition={spring.snappy}
                    className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-flow-green"
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Showcase panel */}
        <Reveal delay={0.05} y={24} className="mt-8">
          <div
            className="overflow-hidden rounded-3xl border border-white/10 p-6 shadow-[var(--shadow-xl)] sm:p-10"
            style={{ backgroundImage: 'var(--gradient-dark-panel)' }}
          >
            {/* popLayout, not "wait": mode="wait" holds the incoming panel
                until the outgoing one has finished leaving, so every tab press
                costs a few hundred ms of dead time and the panel collapses to
                nothing in between. popLayout takes the outgoing panel out of
                flow and lets the new one arrive at once. */}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={spring.ui}
                className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14"
              >
                {/* Artwork */}
                <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4 sm:p-6">
                  <Art />
                </div>

                {/* Detail */}
                <div>
                  <h3 className="font-display text-2xl font-bold text-flow-lime sm:text-3xl">
                    {current.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60 sm:text-base">
                    {current.description}
                  </p>

                  {/* Capability rows — bordered, one per line, the way the
                      reference stacks them. */}
                  <ul className="mt-7 space-y-2.5">
                    {current.features.map((f, i) => (
                      <motion.li
                        key={f}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...spring.ui, delay: 0.06 + i * 0.05 }}
                        className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/80"
                      >
                        {f}
                      </motion.li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <MagneticButton strength={0.2}>
                      <Link
                        href="/portfolio"
                        className="inline-flex items-center gap-2 rounded-full bg-flow-lime px-6 py-3 text-sm font-semibold text-flow-green shadow-[var(--shadow-glow-lime)] transition-colors hover:bg-flow-lime-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-lime focus-visible:ring-offset-2 focus-visible:ring-offset-flow-green-deep"
                      >
                        {content.fullServiceBadge}
                        <ArrowUpRight size={16} className="rtl:-scale-x-100" />
                      </Link>
                    </MagneticButton>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

ServicesSection.displayName = 'ServicesSection'
