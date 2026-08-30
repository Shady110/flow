'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { problems } from '@/data/problems'
import { spring } from '@/lib/animations'
import { useReducedMotion } from '@/lib/useReducedMotion'
import RevealHeading from './ui/RevealHeading'
import Reveal from './ui/Reveal'
import PipelineFlow from './ui/PipelineFlow'

const problemKeys = ['complexity', 'time', 'performance', 'scaling'] as const

/**
 * The problem and the answer to it, as one dark panel in two acts.
 *
 * These were two sections that stated a difficulty and then, after a full
 * ground change, resolved it — which let a reader leave between the setup and
 * the payoff. Reading them as a single passage is the whole point, so they
 * share one ground and the pivot between them is a visual beat rather than a
 * section boundary.
 *
 * Content comes from the untouched `marketing.problem` and `marketing.solution`
 * namespaces; no copy was written or re-translated for this merge.
 */
export default function StorySection() {
  const tp = useTranslations('marketing.problem')
  const ts = useTranslations('marketing.solution')
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  // The lime wash drifts across the panel as it passes — slow enough to read as
  // depth rather than as something moving.
  const glowY = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-12%', '12%'])

  const items = problemKeys.map((key, i) => ({
    icon: problems[i].icon,
    title: tp(`items.${key}.title`),
    description: tp(`items.${key}.description`),
  }))

  const pipelineSteps = [
    ts('pipeline.product'),
    ts('pipeline.content'),
    ts('pipeline.listing'),
    ts('pipeline.publishing'),
    ts('pipeline.account'),
    ts('pipeline.growth'),
  ]
  const chips = [ts('chips.ai'), ts('chips.human'), ts('chips.endToEnd')]

  return (
    <section
      ref={ref}
      id="story"
      className="relative overflow-hidden grain-overlay py-24 md:py-32 lg:py-40"
      style={{ backgroundImage: 'var(--gradient-dark-panel)' }}
    >
      {/* Depth wash. Large moving surfaces stay low-contrast and semi-transparent
          so they read as light, not as an object crossing the screen. */}
      <motion.div
        aria-hidden="true"
        style={{ y: glowY }}
        className="pointer-events-none absolute -top-1/4 end-[-10%] h-[70vh] w-[70vh] rounded-full blur-3xl"
      >
        <div
          className="h-full w-full"
          style={{ background: 'radial-gradient(circle, rgba(196,240,117,0.16) 0%, transparent 68%)' }}
        />
      </motion.div>

      <div className="relative section-container">
        {/* ── Act one: the difficulty ─────────────────────────── */}
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Reveal y={16}>
              <span className="eyebrow-index text-flow-lime/80" data-index="01">
                {tp('eyebrow')}
              </span>
            </Reveal>
            <RevealHeading
              as="h2"
              text={tp('heading')}
              className="mt-6 font-display text-4xl font-bold leading-[1.02] tracking-tight text-white md:text-5xl lg:text-6xl"
            />
          </div>
          <Reveal delay={0.1} className="md:col-span-5">
            <p className="text-base leading-relaxed text-white/60 md:text-end md:ms-auto md:max-w-sm">
              {tp('intro')}
            </p>
          </Reveal>
        </div>

        {/* Four difficulties as a plain numbered register. Cards here would
            dress the problem up; a list lets it read as a tally. */}
        <div className="mt-14 grid gap-x-10 gap-y-px border-t border-white/10 sm:grid-cols-2">
          {items.map((item, i) => {
            const Icon = item.icon
            return (
              <Reveal
                key={item.title}
                delay={i * 0.06}
                y={20}
                className="group border-b border-white/10 py-7"
              >
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.07] ring-1 ring-white/10 transition-colors duration-300 group-hover:bg-flow-lime">
                    <Icon size={18} className="text-flow-lime transition-colors duration-300 group-hover:text-flow-green" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/55">{item.description}</p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        {/* ── The pivot ───────────────────────────────────────── */}
        <div className="mt-20 md:mt-28">
          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-7">
              <Reveal y={16}>
                <span className="eyebrow-index text-flow-lime/70" data-index="02">
                  {ts('eyebrow')}
                </span>
              </Reveal>
              <RevealHeading
                as="h2"
                text={ts('heading')}
                accent={ts('heading').split(' ').slice(-2)}
                accentTone="light"
                className="mt-6 font-display text-4xl font-bold leading-[1.02] tracking-tight text-white md:text-5xl lg:text-6xl"
              />
            </div>
            <Reveal delay={0.1} className="md:col-span-5 md:self-end">
              <p className="text-base leading-relaxed text-white/60">{ts('intro')}</p>
            </Reveal>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {chips.map((chip, i) => (
              <motion.span
                key={chip}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ ...spring.ui, delay: i * 0.06 }}
                className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/80"
              >
                {chip}
              </motion.span>
            ))}
          </div>

          {/* The payoff: the whole pipeline, drawn as you arrive at it. */}
          <div className="mt-16 rounded-3xl border border-white/10 bg-black/20 p-8 md:p-10">
            <PipelineFlow steps={pipelineSteps} tone="dark" />
          </div>
        </div>
      </div>
    </section>
  )
}

StorySection.displayName = 'StorySection'
