'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { faqs } from '@/lib/content'
import { fadeUp } from '@/lib/animations'
import RevealHeading from './ui/RevealHeading'
import Accordion from './ui/Accordion'

export default function FAQSection() {
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
          <span className="eyebrow-index mb-6" data-index="07">FAQ</span>
          <RevealHeading
            text="Questions, answered."
            accent={['answered.']}
            className="section-title mt-6 mb-6"
          />
          <p className="text-flow-text-muted text-base leading-relaxed mb-8">
            Everything you need to know before you send us your first product.
            Still unsure? We&apos;re one message away.
          </p>
          <Link
            href="#contact"
            className="inline-flex items-center gap-2 text-flow-green font-semibold text-sm border-b-2 border-flow-lime pb-1 hover:gap-3 transition-all"
          >
            Talk to us →
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
          <Accordion items={faqs} />
        </motion.div>
      </div>
    </section>
  )
}

FAQSection.displayName = 'FAQSection'
