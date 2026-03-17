'use client'
import { motion } from 'framer-motion'
import LogoMarquee from './LogoMarquee'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

const pipelineSteps = [
  'Product',
  'Content Creation',
  'Listing Optimization',
  'Marketplace Publishing',
  'Account Management',
  'Sales Growth',
]


export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-white overflow-hidden">
      {/* Radial gradient blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, #EAF4E2 0%, rgba(244,250,240,0.5) 50%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
        {/* Left — Text */}
        <div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-flow-lime bg-flow-green px-3 py-1 rounded-full inline-block mb-6">
              Commerce Operations Studio
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="font-display text-5xl md:text-6xl font-bold text-flow-green leading-[1.1] mb-6"
          >
            From Product to Marketplace —{' '}
            <span className="text-flow-green">in One Flow.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-flow-text-muted text-lg leading-relaxed mb-10 max-w-xl"
          >
            We handle everything from product photography and listing creation
            to marketplace publishing and account management — so you can focus
            on growing.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-wrap gap-4 mb-12"
          >
            <a
              href="#contact"
              className="bg-flow-lime text-flow-green font-semibold px-7 py-3.5 rounded-full hover:bg-flow-lime-hover transition-colors text-sm"
            >
              Start Your Flow
            </a>
            <a
              href="#workflow"
              className="border-2 border-flow-green text-flow-green font-semibold px-7 py-3.5 rounded-full hover:bg-flow-green hover:text-white transition-colors text-sm"
            >
              See How It Works
            </a>
          </motion.div>

          {/* Logo marquee */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            <LogoMarquee />
          </motion.div>
        </div>

        {/* Right — Pipeline card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="hidden lg:flex justify-center"
        >
          <div className="bg-white border border-flow-border rounded-2xl shadow-xl p-8 w-full max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-flow-text-muted mb-6">
              The FLOW Pipeline
            </p>
            <div className="flex flex-col">
              {pipelineSteps.map((step, i) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-flow-lime flex items-center justify-center text-flow-green font-bold text-xs shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    {i < pipelineSteps.length - 1 && (
                      <div className="w-px flex-1 my-1 border-l-2 border-dashed border-flow-border" style={{ minHeight: 28 }} />
                    )}
                  </div>
                  <div className="pb-6">
                    <p
                      className={`text-sm font-semibold ${
                        i === pipelineSteps.length - 1
                          ? 'text-flow-green'
                          : 'text-flow-text'
                      }`}
                    >
                      {step}
                      {i === pipelineSteps.length - 1 && (
                        <span className="ml-2 text-xs bg-flow-lime text-flow-green px-2 py-0.5 rounded-full font-semibold">
                          ✓
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
