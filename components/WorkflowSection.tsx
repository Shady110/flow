'use client'
import { useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { workflowSteps } from '@/data/workflow'
import { useReducedMotion } from '@/lib/useReducedMotion'
import RevealHeading from './ui/RevealHeading'

const N = workflowSteps.length

export default function WorkflowSection() {
  const wrapperRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  })

  const stepFloat = useTransform(scrollYProgress, [0, 1], [0, N - 1])

  useMotionValueEvent(stepFloat, 'change', (v) => {
    const i = Math.min(N - 1, Math.max(0, Math.round(v)))
    setActive((prev) => (prev === i ? prev : i))
  })

  function scrollToStep(i: number) {
    const el = wrapperRef.current
    if (!el) return
    const total = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: el.offsetTop + (i / (N - 1)) * total, behavior: 'smooth' })
  }

  const step = workflowSteps[active]

  return (
    <div id="workflow" className="grain-overlay" style={{ backgroundImage: 'var(--gradient-dark-panel)' }}>
      {/* Desktop: pinned scroll-storytelling */}
      <section ref={wrapperRef} className="hidden md:block relative h-[260vh]">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="mb-16 max-w-xl">
              <span className="eyebrow-index text-white/50 mb-6" data-index="05">How It Works</span>
              <RevealHeading
                text="Your product. Our process. Marketplace success."
                accent={['success.']}
                className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.02] tracking-tight mt-6"
              />
              <p className="text-white/60 text-base leading-relaxed mt-5">
                A structured, repeatable workflow designed to get your products live
                faster and performing better.
              </p>
            </div>

            <div className="grid grid-cols-[auto_1fr] gap-16 items-center">
              {/* Progress rail */}
              <div className="flex flex-col gap-3">
                {workflowSteps.map((s, i) => (
                  <button
                    key={s.num}
                    onClick={() => scrollToStep(i)}
                    aria-label={`Go to step ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === active ? 'w-12 bg-flow-lime' : 'w-6 bg-white/20'
                    }`}
                  />
                ))}
                <div className="mt-4 h-0.5 w-24 bg-white/15 relative overflow-hidden rounded-full">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-flow-lime origin-left"
                    style={{ scaleX: scrollYProgress }}
                  />
                </div>
              </div>

              {/* Active step content */}
              <div className="relative min-h-[300px] flex flex-col justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active}
                    initial={reduced ? false : { opacity: 0, y: 24, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={reduced ? undefined : { opacity: 0, y: -24, filter: 'blur(4px)' }}
                    transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="font-display text-7xl lg:text-9xl leading-none font-bold text-flow-lime/25 block -mb-6">
                      {step.num}
                    </span>
                    <h3 className="font-display text-3xl font-bold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-white/60 text-base leading-relaxed max-w-md">
                      {step.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile: plain vertical stack, no pinning/scroll-linking */}
      <section className="md:hidden py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 flex flex-col items-center">
            <span className="eyebrow-index text-white/50 mb-6" data-index="05">How It Works</span>
            <h2 className="font-display text-3xl font-bold text-white leading-tight tracking-tight mt-6 mb-4">
              Your product. Our process. Marketplace success.
            </h2>
            <p className="text-white/60 text-base leading-relaxed max-w-2xl mx-auto">
              A structured, repeatable workflow designed to get your products live
              faster and performing better.
            </p>
          </div>

          <div className="flex flex-col gap-0 relative">
            <div className="absolute left-[21px] top-2 bottom-8 border-l-2 border-dashed border-white/15" />
            {workflowSteps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="relative z-10 flex gap-5"
              >
                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full bg-flow-lime flex items-center justify-center text-flow-green font-bold text-sm shrink-0">
                    {s.num}
                  </div>
                </div>
                <div className="pb-8 pt-1">
                  <p className="font-semibold text-white text-sm mb-1">{s.title}</p>
                  <p className="text-white/60 text-sm leading-relaxed">{s.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

WorkflowSection.displayName = 'WorkflowSection'
