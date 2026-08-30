'use client'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin } from 'lucide-react'
import { useReducedMotion } from '@/lib/useReducedMotion'
import Logo from './ui/Logo'

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="group relative inline-block text-white/60 text-sm hover:text-white transition-colors">
      {children}
      <span className="absolute -bottom-0.5 start-0 h-px w-full origin-left scale-x-0 bg-white/60 transition-transform duration-300 group-hover:scale-x-100 rtl:origin-right" />
    </a>
  )
}

export default function Footer() {
  const t = useTranslations('marketing.footer')
  const reduced = useReducedMotion()
  const serviceLinks = [
    t('services.photography'),
    t('services.listing'),
    t('services.management'),
    t('services.video'),
    t('services.social'),
  ]
  return (
    <footer
      className="relative grain-overlay overflow-hidden"
      style={{ backgroundImage: 'var(--gradient-dark-panel)' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Left — wider brand block */}
          <div className="relative md:col-span-5">
            {/* A 6s opacity loop is a slow oscillation in the band that
                triggers motion sensitivity, so it holds still when asked. */}
            <motion.div
              animate={reduced ? { opacity: 0.55 } : { opacity: [0.4, 0.7, 0.4] }}
              transition={reduced ? { duration: 0 } : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute -top-6 -start-6 h-40 w-40 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(196,240,117,0.35) 0%, transparent 70%)' }}
            />
            <Logo variant="lockup" tone="white" className="relative mb-5 h-9" />
            <p className="relative text-white font-semibold text-sm mb-3">
              {t('tagline')}
            </p>
            <p className="relative text-white/60 text-sm leading-relaxed">
              {t('blurb')}
            </p>
          </div>

          {/* Center */}
          <div className="md:col-span-3">
            <p className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              {t('servicesTitle')}
            </p>
            <ul className="space-y-3">
              {serviceLinks.map((s) => (
                <li key={s}>
                  <FooterLink href="/#services">{s}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Right */}
          <div className="md:col-span-4">
            <p className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              {t('contactTitle')}
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-white/60 shrink-0" />
                <FooterLink href="tel:+201550408340">01550408340</FooterLink>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-white/60 shrink-0" />
                <FooterLink href="tel:+201121443286">01121443286</FooterLink>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-white/60 shrink-0" />
                <FooterLink href="tel:+201125450608">01125450608</FooterLink>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-white/60 shrink-0" />
                <FooterLink href="mailto:flowagency.eg@gmail.com">flowagency.eg@gmail.com</FooterLink>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-white/60 shrink-0" />
                <span className="text-white/60 text-sm">{t('location')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 text-center">
          <p className="text-white/40 text-sm">{t('rights')}</p>
        </div>
      </div>
    </footer>
  )
}

Footer.displayName = 'Footer'
