'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { portfolioData, getAllImagesFromCategory } from '@/data/portfolioData'
import MagneticButton from './ui/MagneticButton'
import ParallaxLayer from './ui/ParallaxLayer'
import Counter from './ui/Counter'
import RevealHeading from './ui/RevealHeading'
import { fadeUp } from '@/lib/animations'
import type { HeroContent } from '@/data/landing-content'

// Some categories lead with a lifestyle/model shot — pin those to a
// product-only cover so the hero strip shows products, never people.
const productCovers: Record<string, string> = {
  accessories: '/assets/portfolio/Accessories/Wallet/61BygHH-M2L._AC_UY1000_.jpg',
  home: '/assets/portfolio/Home/cookware/Gemini_Generated_Image_5d0wwd5d0wwd5d0w.png',
}

// A curated strip of real product shots for the floating gallery.
const gallery = portfolioData.slice(0, 5).map((cat) => ({
  src: productCovers[cat.id] ?? getAllImagesFromCategory(cat)[0]?.src ?? '',
  alt: `${cat.name} product photography`,
}))

// Depth/rotation per card so the row feels hand-arranged.
const tilts = [
  { rotate: -6, y: 28, z: 10 },
  { rotate: 4, y: 8, z: 20 },
  { rotate: -2, y: -8, z: 30 },
  { rotate: 5, y: 6, z: 20 },
  { rotate: -5, y: 26, z: 10 },
]

export default function HeroSection({ content }: { content: HeroContent }) {
  const { badge, heading, accent, subheading, ctaPrimary, ctaSecondary, stats } = content
  return (
    <section className="relative min-h-screen flex flex-col items-center overflow-hidden bg-flow-bg grain-overlay">
      {/* Layered background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero-mesh)' }} />
        <ParallaxLayer speed={0.5} className="absolute top-1/4 right-[12%]">
          <div
            className="w-[420px] h-[420px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(196,240,117,0.28) 0%, transparent 70%)' }}
          />
        </ParallaxLayer>
        <ParallaxLayer speed={0.3} className="absolute top-1/3 left-[8%]">
          <div
            className="w-[320px] h-[320px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(20,60,40,0.10) 0%, transparent 70%)' }}
          />
        </ParallaxLayer>
      </div>

      {/* Text block */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-5 sm:px-6 text-center pt-32 md:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2.5 rounded-full border border-flow-border bg-white/70 backdrop-blur px-3 py-1.5 mb-8 shadow-[var(--shadow-xs)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-flow-green opacity-60 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-flow-green" />
          </span>
          <span className="text-xs font-semibold text-flow-green">
            {badge}
          </span>
        </motion.div>

        <RevealHeading
          as="h1"
          text={heading}
          accent={accent}
          whileInView={false}
          className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-flow-green leading-[0.98] tracking-tight"
        />

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="text-flow-text-muted text-base sm:text-lg leading-relaxed mt-7 max-w-2xl mx-auto"
        >
          {subheading}
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="flex flex-wrap justify-center gap-4 mt-10"
        >
          <MagneticButton>
            <a
              href="#contact"
              className="flex items-center gap-2 bg-flow-green text-flow-bg font-semibold px-7 py-3.5 rounded-full hover:bg-flow-green-hover transition-colors text-sm shadow-[var(--shadow-md)]"
            >
              {ctaPrimary}
              <ArrowRight size={16} className="rtl:-scale-x-100" />
            </a>
          </MagneticButton>
          <MagneticButton strength={0.2}>
            <a
              href="#workflow"
              className="block border border-flow-green/25 text-flow-green font-semibold px-7 py-3.5 rounded-full hover:bg-flow-green hover:text-flow-bg transition-colors text-sm bg-white/50 backdrop-blur"
            >
              {ctaSecondary}
            </a>
          </MagneticButton>
        </motion.div>

        {/* Inline stats */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="flex items-center justify-center gap-8 sm:gap-12 mt-12"
        >
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-center gap-8 sm:gap-12">
              {i > 0 && <div className="w-px h-8 bg-flow-border" />}
              <div className="text-center">
                <p className="font-display text-2xl sm:text-3xl font-bold text-flow-green">
                  <Counter value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-[11px] sm:text-xs text-flow-text-muted uppercase tracking-wide mt-1 whitespace-nowrap">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Floating portfolio gallery — hidden on mobile */}
      <div className="relative z-10 w-full mt-10 md:mt-14 flex-1 hidden md:flex items-end">
        <div className="w-full flex justify-center items-end gap-3 sm:gap-5 px-4 pb-0 -mb-6 md:-mb-10">
          {gallery.map((img, i) => {
            const t = tilts[i]
            // Hide the outermost cards on small screens to avoid crowding.
            const responsive = i === 0 || i === 4 ? 'hidden lg:block' : i === 1 || i === 3 ? 'hidden sm:block' : ''
            return (
              <motion.div
                key={img.src}
                initial={{ opacity: 0, y: 60, rotate: t.rotate }}
                animate={{ opacity: 1, y: t.y, rotate: t.rotate }}
                transition={{ delay: 0.5 + i * 0.09, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ zIndex: t.z }}
                className={`relative shrink-0 ${responsive}`}
              >
                <div className="animate-float-slow" style={{ animationDelay: `${i * 0.6}s` }}>
                  <div className="relative w-40 h-52 sm:w-44 sm:h-56 md:w-52 md:h-64 rounded-2xl overflow-hidden border-4 border-white shadow-[var(--shadow-xl)] bg-flow-bg-muted">
                    {img.src && (
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        sizes="(max-width: 768px) 40vw, 220px"
                        className="object-cover"
                        priority={i === 2}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
