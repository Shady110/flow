'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight, Mail } from 'lucide-react'
import RevealHeading from './ui/RevealHeading'
import Reveal from './ui/Reveal'
import Accordion from './ui/Accordion'
import type { FaqContent } from '@/data/landing-content'

/**
 * @param email surfaced in the aside card. Passed in rather than read from
 * FaqContent so the FAQ content shape stays exactly as the dashboard editor
 * and the stored blob expect it.
 */
export default function FAQSection({ content, email }: { content: FaqContent; email?: string }) {
  const t = useTranslations('marketing.faqAside')

  return (
    <section id="faq" className="section-padding bg-flow-bg">
      <div className="section-container grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left — sticky intro, with the escape hatch underneath it */}
        <Reveal className="lg:sticky lg:top-28 lg:col-span-5">
          <span className="eyebrow-index text-flow-text-muted" data-index="07">
            {content.eyebrow}
          </span>
          <RevealHeading
            text={content.heading}
            accent={content.accent}
            className="section-title mt-6"
          />
          <p className="mt-6 text-base leading-relaxed text-flow-text-muted">{content.intro}</p>
          <Link
            href="/#contact"
            className="group mt-8 inline-flex items-center gap-2 border-b-2 border-flow-lime pb-1 text-sm font-semibold text-flow-green"
          >
            {content.cta}
            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
            />
          </Link>

          {/* An FAQ can only ever cover the questions we thought of; this is
              the way out for the ones we did not. */}
          {email && (
            <div className="surface-elevated mt-10 p-6">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-flow-lime">
                <Mail size={18} className="text-flow-green" />
              </span>
              <p className="font-display text-lg font-bold text-flow-green">{t('title')}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-flow-text-muted">{t('intro')}</p>
              <a
                href={`mailto:${email}`}
                className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-flow-green"
              >
                {email}
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                />
              </a>
            </div>
          )}
        </Reveal>

        {/* Right — accordion */}
        <Reveal delay={0.1} className="lg:col-span-7">
          <Accordion items={content.items} />
        </Reveal>
      </div>
    </section>
  )
}

FAQSection.displayName = 'FAQSection'
