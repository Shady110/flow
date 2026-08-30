'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { SERVICE_OPTIONS, SERVICE_VALUES } from '@/lib/service-options'
import { AnimatePresence, motion } from 'framer-motion'
import { Mail, MessageCircle, MapPin, Phone, type LucideIcon } from 'lucide-react'
import { spring } from '@/lib/animations'
import MagneticButton from './ui/MagneticButton'
import RevealHeading from './ui/RevealHeading'
import Reveal from './ui/Reveal'
import type { ContactContent } from '@/data/landing-content'

type Status = 'idle' | 'loading' | 'success' | 'error'

const phoneIcons: LucideIcon[] = [Phone, MessageCircle, MessageCircle]

/** One shared field style — a solid surface, because a translucent input on a
 *  translucent card is the stack that destroys legibility. */
const field =
  'w-full rounded-xl border border-flow-border bg-flow-bg px-4 py-3 text-sm text-flow-text outline-none transition-shadow focus:ring-2 focus:ring-flow-lime focus-visible:ring-2 focus-visible:ring-flow-lime'

export default function ContactSection({ content }: { content: ContactContent }) {
  const t = useTranslations('marketing.contactForm')
  const [status, setStatus] = useState<Status>('idle')
  // Which pricing card sent them here, if any.
  const planParam = useSearchParams().get('plan')
  const presetPlan = planParam && SERVICE_VALUES.includes(planParam) ? planParam : null

  const contactDetails = [
    ...content.phones.map((label, i) => ({
      icon: phoneIcons[i] ?? Phone,
      href: `tel:+2${label}`,
      label,
    })),
    { icon: Mail, href: `mailto:${content.email}`, label: content.email },
  ]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      platform: (form.elements.namedItem('platform') as HTMLSelectElement).value,
      products: (form.elements.namedItem('products') as HTMLInputElement).value,
      service: (form.elements.namedItem('service') as HTMLSelectElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  // Light, deliberately. This is the one screen where someone is being asked to
  // do work, and a dark form reads as heavier than it is — the CTA band right
  // above already supplies the contrast beat. The old angled panel here was a
  // hardcoded left-to-right clip-path that pointed the wrong way in Arabic; the
  // ground change does that job with no handedness.
  return (
    <section id="contact" className="relative overflow-hidden bg-flow-bg-soft py-24 md:py-28">
      <div className="section-container grid grid-cols-1 items-start gap-14 lg:grid-cols-12 lg:gap-16">
        {/* Left */}
        <Reveal className="lg:col-span-4">
          <span className="eyebrow-index text-flow-text-muted" data-index="08">
            {content.eyebrow}
          </span>
          <RevealHeading
            text={content.heading}
            accent={content.accent}
            className="section-title mt-6"
          />
          <p className="mb-10 mt-6 text-base leading-relaxed text-flow-text-muted">{content.intro}</p>

          <div className="space-y-5">
            {contactDetails.map(({ icon: Icon, href, label }, i) => (
              <Reveal key={label} delay={i * 0.06} y={16} className="flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-flow-bg-muted ring-1 ring-flow-border">
                  <Icon size={18} className="text-flow-green" />
                </span>
                <a
                  href={href}
                  className="text-sm text-flow-text-muted transition-colors hover:text-flow-green"
                >
                  {label}
                </a>
              </Reveal>
            ))}
            <Reveal delay={contactDetails.length * 0.06} y={16} className="flex items-center gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-flow-bg-muted ring-1 ring-flow-border">
                <MapPin size={18} className="text-flow-green" />
              </span>
              <span className="text-sm text-flow-text-muted">{content.location}</span>
            </Reveal>
          </div>
        </Reveal>

        {/* Right — Form. A solid light card, not glass: a form is the one place
            on the page where legibility beats atmosphere outright. */}
        <Reveal delay={0.1} className="lg:col-span-8">
          <form
            className="space-y-5 rounded-3xl border border-flow-border bg-white p-6 shadow-[var(--shadow-lg)] sm:p-8"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-flow-green">
                  {t('fullName')}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t('namePlaceholder')}
                  required
                  aria-required="true"
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-flow-green">
                  {t('email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  required
                  aria-required="true"
                  className={field}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-flow-green">
                  {t('phone')}
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder={t('phonePlaceholder')}
                  className={field}
                />
              </div>
              <div>
                <label
                  htmlFor="platform"
                  className="mb-1.5 block text-sm font-medium text-flow-green"
                >
                  {t('platform')}
                </label>
                <select id="platform" name="platform" className={field}>
                  <option value="">{t('selectPlatform')}</option>
                  <option value="amazon">Amazon</option>
                  <option value="noon">Noon</option>
                  <option value="tiktok-shop">TikTok Shop</option>
                  <option value="shopify">Shopify</option>
                  <option value="other">{t('platformOptions.other')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="products"
                  className="mb-1.5 block text-sm font-medium text-flow-green"
                >
                  {t('products')}
                </label>
                <input
                  id="products"
                  name="products"
                  type="text"
                  placeholder={t('productsPlaceholder')}
                  className={field}
                />
              </div>
              <div>
                <label
                  htmlFor="service"
                  className="mb-1.5 block text-sm font-medium text-flow-green"
                >
                  {t('service')}
                </label>
                <select
                  id="service"
                  name="service"
                  // Preselected from ?plan=… when the visitor arrived by clicking
                  // a pricing card. `key` remounts it if they click another one.
                  key={presetPlan ?? 'none'}
                  defaultValue={presetPlan ?? ''}
                  className={field}
                >
                  <option value="">{t('selectService')}</option>
                  {SERVICE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(`serviceOptions.${o.key}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-flow-green">
                {t('message')}
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder={t('messagePlaceholder')}
                className={`${field} resize-none`}
              />
            </div>

            <AnimatePresence mode="wait">
              {status === 'success' && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={spring.ui}
                  className="overflow-hidden rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                >
                  {t('success')}
                </motion.p>
              )}
              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={spring.ui}
                  className="overflow-hidden rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {t('error')}
                </motion.p>
              )}
            </AnimatePresence>

            <MagneticButton strength={0.15} className="block w-full">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-xl bg-flow-green py-4 text-sm font-bold text-flow-lime shadow-[var(--shadow-xs)] transition-colors hover:bg-flow-green-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'loading' ? t('sending') : t('send')}
              </button>
            </MagneticButton>

            <MagneticButton strength={0.15} className="block w-full">
              <a
                href={`https://wa.me/2${content.phones[0] ?? ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-green-700 py-4 text-sm font-bold text-green-700 transition-colors hover:bg-green-700 hover:text-white"
              >
                <MessageCircle size={18} />
                {t('whatsapp')}
              </a>
            </MagneticButton>
          </form>
        </Reveal>
      </div>
    </section>
  )
}

ContactSection.displayName = 'ContactSection'
