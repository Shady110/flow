'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { portfolioData, getAllImagesFromCategory } from '@/data/portfolioData'
import { tileReveal, staggerContainer } from '@/lib/animations'
import RevealHeading from './ui/RevealHeading'
import TiltCard from './ui/TiltCard'
import Counter from './ui/Counter'
import MagneticButton from './ui/MagneticButton'

// One representative cover per category + total shot count.
const categories = portfolioData.map((cat) => {
  const images = getAllImagesFromCategory(cat)
  return {
    id: cat.id,
    name: cat.name,
    count: images.length,
    cover: images[0]?.src ?? '',
  }
})

const totalShots = categories.reduce((sum, c) => sum + c.count, 0)

// Editorial bento: first tile is wide, one tall accent, rest uniform.
const spans = [
  'sm:col-span-2 lg:col-span-2 lg:row-span-2',
  'lg:row-span-1',
  'lg:row-span-1',
  'lg:row-span-2',
  'lg:row-span-1',
  'lg:row-span-1',
  'lg:row-span-1',
  'lg:row-span-1',
]

export default function PortfolioGridSection() {
  return (
    <section id="work" className="section-padding bg-flow-bg">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-10">
          <div className="max-w-2xl">
            <span className="eyebrow-index mb-6" data-index="04">Selected Work</span>
            <RevealHeading
              text="Product photography that sells across every category."
              accent={['sells']}
              className="section-title mt-6"
            />
          </div>
          <div className="flex items-end gap-8 shrink-0">
            <div>
              <p className="font-display text-4xl font-bold text-flow-green">
                <Counter value={totalShots} suffix="+" />
              </p>
              <p className="text-sm text-flow-text-muted mt-1">Products shot</p>
            </div>
            <div>
              <p className="font-display text-4xl font-bold text-flow-green">
                <Counter value={categories.length} />
              </p>
              <p className="text-sm text-flow-text-muted mt-1">Categories</p>
            </div>
          </div>
        </div>

        {/* Bento grid of category covers */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[180px] sm:auto-rows-[220px] gap-4"
        >
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              variants={tileReveal}
              custom={i}
              className={`group ${spans[i] ?? ''}`}
            >
              <TiltCard intensity={5} className="h-full">
                <Link
                  href={`/portfolio#${cat.id}`}
                  aria-label={`View ${cat.name} portfolio`}
                  className="relative block h-full w-full overflow-hidden rounded-3xl border border-flow-border bg-flow-bg-muted shadow-[var(--shadow-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-green focus-visible:ring-offset-2"
                >
                  {cat.cover && (
                    <Image
                      src={cat.cover}
                      alt={`${cat.name} — product photography`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                  {/* Gradient scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-flow-green-deep/80 via-flow-green-deep/10 to-transparent opacity-90" />
                  {/* Label */}
                  <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between">
                    <div>
                      <p className="font-display text-lg font-bold text-white leading-tight">
                        {cat.name}
                      </p>
                      <p className="text-xs text-white/70 mt-0.5">{cat.count} shots</p>
                    </div>
                    <span className="w-9 h-9 rounded-full bg-flow-lime text-flow-green flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <MagneticButton>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 bg-flow-green text-flow-bg font-semibold px-7 py-3.5 rounded-full hover:bg-flow-green-hover transition-colors text-sm shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-green focus-visible:ring-offset-2"
            >
              Explore the full portfolio
              <ArrowUpRight size={16} />
            </Link>
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}

PortfolioGridSection.displayName = 'PortfolioGridSection'
