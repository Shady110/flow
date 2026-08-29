'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import MagneticButton from './ui/MagneticButton'
import Counter from './ui/Counter'
import RevealHeading from './ui/RevealHeading'
import { spring } from '@/lib/animations'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { HeroArt } from './ui/illustrations'
import type { HeroContent } from '@/data/landing-content'

/**
 * The hero.
 *
 * Centred, and deliberately not full-height. A hero that fills the viewport
 * exactly gives a visitor no reason to believe anything follows it — the single
 * most common way a landing page loses someone on the first screen. This one
 * ends just below the fold and lets the artwork cross that line, so the page
 * reads as continuing before anyone has decided whether to scroll.
 *
 * The artwork is also the argument: it shows the whole service — raw product in,
 * live ranked listing out — before a word of the sections below is read.
 */
export default function HeroSection({ content }: { content: HeroContent }) {
  const { heading, accent, subheading, ctaPrimary, ctaSecondary, stats } = content
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  // Text recedes a little as the page leaves; the artwork rises to meet the
  // next section. They separate rather than sliding as one slab, which is what
  // gives the handover depth.
  const textLift = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -60])
  const textFade = useTransform(scrollYProgress, [0, 0.7], [1, reduced ? 1 : 0.15])
  const artLift = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -110])

  return (
    <section ref={ref} className="relative overflow-hidden bg-flow-bg grain-overlay">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'var(--gradient-hero-mesh)' }}
      />

      <div className="relative z-10 section-container pt-32 md:pt-40">
        <motion.div style={{ y: textLift, opacity: textFade }} className="flex flex-col items-center text-center">
          <RevealHeading
            as="h1"
            text={heading}
            accent={accent}
            whileInView={false}
            className="max-w-4xl font-display text-[clamp(2.5rem,4.5vw,5rem)] font-bold leading-[0.98] tracking-[-0.034em] text-flow-green"
          />

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.ui, delay: 0.22 }}
            className="mt-7 max-w-2xl text-base leading-relaxed text-flow-text-muted sm:text-lg"
          >
            {subheading}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.ui, delay: 0.3 }}
            className="mt-9 flex flex-wrap justify-center gap-3"
          >
            <MagneticButton>
              <a
                href="#contact"
                className="flex items-center gap-2 rounded-full bg-flow-green px-7 py-3.5 text-sm font-semibold text-flow-bg shadow-[var(--shadow-md)] transition-colors hover:bg-flow-green-hover"
              >
                {ctaPrimary}
                <ArrowRight size={16} className="rtl:-scale-x-100" />
              </a>
            </MagneticButton>
            <MagneticButton strength={0.2}>
              <a
                href="#workflow"
                className="block rounded-full border border-flow-green/25 bg-white/60 px-7 py-3.5 text-sm font-semibold text-flow-green backdrop-blur transition-colors hover:bg-flow-green hover:text-flow-bg"
              >
                {ctaSecondary}
              </a>
            </MagneticButton>
          </motion.div>

          {/* Proof sits directly under the CTAs, where it answers the doubt
              the CTAs have just raised. */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.ui, delay: 0.38 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-16"
          >
            {stats.map((s, i) => (
              <div key={s.label} className="flex items-center gap-10 sm:gap-16">
                {i > 0 && <span aria-hidden="true" className="h-9 w-px bg-flow-border" />}
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-flow-green sm:text-3xl">
                    <Counter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1 whitespace-nowrap text-[11px] uppercase tracking-[0.14em] text-flow-text-muted">
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* The anchor. Deliberately clipped by the fold — the cut edge is the
            invitation, and it beats any "scroll" label for getting someone to
            move. */}
        <motion.div
          style={{ y: artLift }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring.ui, delay: 0.46, duration: 0.6 }}
          className="relative mx-auto mt-14 -mb-16 max-w-5xl md:mt-16 md:-mb-24"
        >
          <div
            className="rounded-t-3xl border border-white/10 border-b-0 px-6 pb-16 pt-8 shadow-[var(--shadow-xl)] sm:px-10 sm:pt-10"
            style={{ backgroundImage: 'var(--gradient-dark-panel)' }}
          >
            <HeroArt />
          </div>
        </motion.div>
      </div>

      <ScrollCue reduced={reduced} />
    </section>
  )
}

/**
 * A quiet nudge. It rides on top of the clipped artwork and fades out the
 * instant scrolling starts, so it never nags someone already moving.
 */
function ScrollCue({ reduced }: { reduced: boolean }) {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 140], [1, 0])

  return (
    <motion.div
      aria-hidden="true"
      style={reduced ? undefined : { opacity }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ...spring.ui, delay: 1 }}
      className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2"
    >
      <motion.span
        animate={reduced ? undefined : { y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-flow-lime backdrop-blur"
      >
        <ChevronDown size={16} />
      </motion.span>
    </motion.div>
  )
}
