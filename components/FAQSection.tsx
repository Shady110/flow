'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { fadeUp } from '@/lib/animations'
import RevealHeading from './ui/RevealHeading'
import Accordion from './ui/Accordion'
import type { FaqContent } from '@/data/landing-content'

export default function FAQSection({ content }: { content: FaqContent }) {
  return (
    <section id="faq" className="section-padding bg-flow-bg">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left — sticky intro */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="lg:col-span-5 lg:sticky lg:top-28"
        >
          <span className="eyebrow-index mb-6" data-index="07">{content.eyebrow}</span>
          <RevealHeading
            text={content.heading}
            accent={content.accent}
            className="section-title mt-6 mb-6"
          />
          <p className="text-flow-text-muted text-base leading-relaxed mb-8">
            {content.intro}
          </p>
          <Link
            href="#contact"
            className="inline-flex items-center gap-2 text-flow-green font-semibold text-sm border-b-2 border-flow-lime pb-1 hover:gap-3 transition-all"
          >
            {content.cta}
          </Link>
        </motion.div>

        {/* Right — accordion */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          custom={1}
          className="lg:col-span-7"
        >
          <Accordion items={content.items} />
        </motion.div>
      </div>
    </section>
  )
}

FAQSection.displayName = 'FAQSection'
