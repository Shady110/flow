'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import { Mail, MessageCircle, MapPin, Phone, type LucideIcon } from 'lucide-react'
import { fadeUp, staggerContainer, revealUp } from '@/lib/animations'
import MagneticButton from './ui/MagneticButton'
import RevealHeading from './ui/RevealHeading'
import type { ContactContent } from '@/data/landing-content'

type Status = 'idle' | 'loading' | 'success' | 'error'

const phoneIcons: LucideIcon[] = [Phone, MessageCircle, MessageCircle]

export default function ContactSection({ content }: { content: ContactContent }) {
  const t = useTranslations('marketing.contactForm')
  const [status, setStatus] = useState<Status>('idle')

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

  return (
    <section id="contact" className="section-padding bg-flow-bg relative overflow-hidden">
      {/* Layered angled background panel behind the asymmetric split */}
      <div
        className="hidden lg:block absolute right-0 top-0 bottom-0 w-2/3 bg-flow-bg-soft pointer-events-none"
        style={{ clipPath: 'polygon(18% 0, 100% 0, 100% 100%, 0% 100%)' }}
      />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          custom={0}
          className="lg:col-span-4"
        >
          <span className="eyebrow-index mb-6" data-index="08">{content.eyebrow}</span>
          <RevealHeading
            text={content.heading}
            accent={content.accent}
            className="section-title mt-6 mb-6"
          />
          <p className="text-flow-text-muted text-base leading-relaxed mb-10">
            {content.intro}
          </p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="space-y-5"
          >
            {contactDetails.map(({ icon: Icon, href, label }) => (
              <motion.div key={label} variants={revealUp} className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-10 h-10 rounded-full bg-flow-bg-muted flex items-center justify-center shrink-0"
                >
                  <Icon size={18} className="text-flow-green" />
                </motion.div>
                <a href={href} className="text-flow-text-muted text-sm hover:text-flow-green transition-colors">
                  {label}
                </a>
              </motion.div>
            ))}
            <motion.div variants={revealUp} className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-10 h-10 rounded-full bg-flow-bg-muted flex items-center justify-center shrink-0"
              >
                <MapPin size={18} className="text-flow-green" />
              </motion.div>
              <span className="text-flow-text-muted text-sm">{content.location}</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right — Form */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          custom={1}
          className="lg:col-span-8"
        >
          <form className="glass-card space-y-5 p-8" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-flow-green mb-1.5">
                  {t('fullName')}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t('namePlaceholder')}
                  required
                  aria-required="true"
                  className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow focus-visible:ring-2 focus-visible:ring-flow-lime bg-white/80"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-flow-green mb-1.5">
                  {t('email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  required
                  aria-required="true"
                  className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow focus-visible:ring-2 focus-visible:ring-flow-lime bg-white/80"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-flow-green mb-1.5">
                  {t('phone')}
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder={t('phonePlaceholder')}
                  className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow focus-visible:ring-2 focus-visible:ring-flow-lime bg-white/80"
                />
              </div>
              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-flow-green mb-1.5">
                  {t('platform')}
                </label>
                <select
                  id="platform"
                  name="platform"
                  className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow bg-white/80 focus-visible:ring-2 focus-visible:ring-flow-lime"
                >
                  <option value="">{t('selectPlatform')}</option>
                  <option value="amazon">Amazon</option>
                  <option value="noon">Noon</option>
                  <option value="tiktok-shop">TikTok Shop</option>
                  <option value="shopify">Shopify</option>
                  <option value="other">{t('platformOptions.other')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="products" className="block text-sm font-medium text-flow-green mb-1.5">
                  {t('products')}
                </label>
                <input
                  id="products"
                  name="products"
                  type="text"
                  placeholder={t('productsPlaceholder')}
                  className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow focus-visible:ring-2 focus-visible:ring-flow-lime bg-white/80"
                />
              </div>
              <div>
                <label htmlFor="service" className="block text-sm font-medium text-flow-green mb-1.5">
                  {t('service')}
                </label>
                <select
                  id="service"
                  name="service"
                  className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow bg-white/80 focus-visible:ring-2 focus-visible:ring-flow-lime"
                >
                  <option value="">{t('selectService')}</option>
                  <option value="growth">{t('serviceOptions.growth')}</option>
                  <option value="growth-starter">{t('serviceOptions.growthStarter')}</option>
                  <option value="growth-scale">{t('serviceOptions.growthScale')}</option>
                  <option value="account-basic">{t('serviceOptions.accountBasic')}</option>
                  <option value="account-premium">{t('serviceOptions.accountPremium')}</option>
                  <option value="full-content">{t('serviceOptions.fullContent')}</option>
                  <option value="photography">{t('serviceOptions.photography')}</option>
                  <option value="listing">{t('serviceOptions.listing')}</option>
                  <option value="not-sure">{t('serviceOptions.notSure')}</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-flow-green mb-1.5">
                {t('message')}
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder={t('messagePlaceholder')}
                className="w-full border border-flow-border rounded-xl px-4 py-3 text-sm text-flow-text outline-none focus:ring-2 focus:ring-flow-lime transition-shadow resize-none focus-visible:ring-2 focus-visible:ring-flow-lime bg-white/80"
              />
            </div>

            <AnimatePresence mode="wait">
              {status === 'success' && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 overflow-hidden"
                >
                  {t('success')}
                </motion.p>
              )}
              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 overflow-hidden"
                >
                  {t('error')}
                </motion.p>
              )}
            </AnimatePresence>

            <MagneticButton strength={0.15} className="block w-full">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-flow-lime text-flow-green font-bold py-4 rounded-xl hover:bg-flow-lime-hover transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-lime focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-glow-lime)]"
              >
                {status === 'loading' ? t('sending') : t('send')}
              </button>
            </MagneticButton>

            <MagneticButton strength={0.15} className="block w-full">
              <a
                href={`https://wa.me/2${content.phones[0] ?? ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 border-2 border-green-700 text-green-700 font-bold py-4 rounded-xl hover:bg-green-700 hover:text-white transition-colors text-sm"
              >
                <MessageCircle size={18} />
                {t('whatsapp')}
              </a>
            </MagneticButton>
          </form>
        </motion.div>
      </div>
    </section>
  )
}

ContactSection.displayName = 'ContactSection'
