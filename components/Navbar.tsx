'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { useScrolled } from '@/hooks/useScrolled'
import { spring } from '@/lib/animations'
import MagneticButton from './ui/MagneticButton'
import Logo from './ui/Logo'
import LanguageSwitcher from './LanguageSwitcher'

interface DropdownItem {
  label: string
  href: string
  desc?: string
}
interface NavItem {
  key: string
  label: string
  href: string
  children?: DropdownItem[]
}

export default function Navbar({ heroTone = 'light' }: { heroTone?: 'light' | 'dark' } = {}) {
  const t = useTranslations('marketing.nav')
  const scrolled = useScrolled(20)
  // Before anything is scrolled the bar has no surface of its own, so its ink
  // has to answer to whatever hero it is sitting on. Once the material fades
  // in the bar is always light, so the ink goes back to green regardless.
  const onDark = !scrolled && heroTone === 'dark'
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const nav: NavItem[] = [
    {
      key: 'services',
      label: t('services'),
      href: '/#services',
      children: [
        { label: t('services_dd.content'), href: '/#services', desc: t('services_dd.contentDesc') },
        { label: t('services_dd.listing'), href: '/#services', desc: t('services_dd.listingDesc') },
        { label: t('services_dd.management'), href: '/#services', desc: t('services_dd.managementDesc') },
        { label: t('services_dd.account'), href: '/#services', desc: t('services_dd.accountDesc') },
      ],
    },
    {
      key: 'work',
      label: t('work'),
      href: '/#work',
      children: [
        { label: t('work_dd.fashion'), href: '/portfolio#fashion' },
        { label: t('work_dd.electronics'), href: '/portfolio#electronics' },
        { label: t('work_dd.cosmetics'), href: '/portfolio#cosmetics' },
        { label: t('work_dd.viewAll'), href: '/portfolio' },
      ],
    },
    { key: 'pricing', label: t('pricing'), href: '/pricing' },
    // 'team' is deliberately absent: TeamSection is commented out of the landing
    // page, so /#team was a link to nothing. Restore both together or neither.
    { key: 'faq', label: t('faq'), href: '/#faq' },
  ]

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed z-50 top-0 inset-x-0 md:top-4 md:inset-x-6 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:w-full lg:max-w-5xl"
    >
      {/* At rest the bar has no surface at all — it reads as part of the hero.
          The material arrives only once there is content passing underneath it
          to separate from.

          The chrome is a separate layer whose opacity is animated, rather than
          a class toggled on the bar itself. `backdrop-filter` does not
          interpolate from `none`, so toggling it would snap the blur on while
          the background faded; fading a layer that already carries the blur
          brings background, border, shadow and blur in together.

          Neutral rather than brand-coloured: the bar crosses light and dark
          sections alike, and a saturated green pill fought whichever one it
          happened to be over. Ink and the single CTA carry the brand. */}
      <div
        className="relative transition-colors duration-300 md:rounded-full"
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <div
          aria-hidden="true"
          className={`chrome-light absolute inset-0 transition-opacity duration-300 md:rounded-full ${
            scrolled ? 'opacity-100 shadow-[var(--shadow-md)]' : 'opacity-0'
          }`}
        />
        <div className="relative">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 ps-5 pe-3 md:h-14 md:ps-6 md:pe-3">
          <Link href="/" className="shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-green">
            <Logo variant="lockup" tone={onDark ? 'white' : 'green'} priority className="h-6 md:h-7" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {nav.map((item) => (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.children ? item.key : null)}
              >
                <Link
                  href={item.href}
                  className={`on-chrome flex items-center gap-1 rounded-full px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 ${onDark ? 'text-white/80 hover:text-white focus-visible:ring-flow-lime' : 'text-flow-text-muted hover:text-flow-green focus-visible:ring-flow-green'}`}
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        openDropdown === item.key ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </Link>

                {item.children && (
                  <AnimatePresence>
                    {openDropdown === item.key && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={spring.snappy}
                        // Grows from the trigger it belongs to, not from its own
                        // centre — the spatial link is the whole affordance.
                        style={{ transformOrigin: 'top center' }}
                        className="absolute start-0 top-full w-64 pt-3"
                      >
                        <div className="rounded-2xl border border-flow-border bg-white p-2 shadow-[var(--shadow-lg)]">
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              className="block rounded-xl px-3 py-2.5 hover:bg-flow-bg-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-green"
                            >
                              <span className="block text-sm font-semibold text-flow-green">
                                {child.label}
                              </span>
                              {child.desc && (
                                <span className="block text-xs text-flow-text-muted mt-0.5">
                                  {child.desc}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          {/* Availability + CTA */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <LanguageSwitcher tone={onDark ? 'light' : 'dark'} />
            <MagneticButton strength={0.2}>
              <Link
                href="/#contact"
                className={`block rounded-full px-5 py-2 text-sm font-semibold shadow-[var(--shadow-xs)] transition-colors focus-visible:outline-none focus-visible:ring-2 ${onDark ? 'bg-flow-lime text-flow-green hover:bg-flow-lime-hover focus-visible:ring-flow-lime' : 'bg-flow-green text-flow-bg hover:bg-flow-green-hover focus-visible:ring-flow-green'}`}
              >
                {t('cta')}
              </Link>
            </MagneticButton>
          </div>

          {/* Mobile toggle */}
          <button
            className="flex flex-col justify-center gap-1.5 rounded p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-green md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t('toggleMenu')}
            aria-expanded={menuOpen}
          >
            <span className={`block h-0.5 w-6 transition-colors ${onDark ? 'bg-white' : 'bg-flow-green'}`} />
            <span className={`block h-0.5 w-6 transition-colors ${onDark ? 'bg-white' : 'bg-flow-green'}`} />
            <span className={`block h-0.5 w-4 transition-colors ${onDark ? 'bg-white' : 'bg-flow-green'}`} />
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={spring.ui}
              className={`overflow-hidden border-t md:hidden ${onDark ? 'border-white/15' : 'border-flow-border'}`}
            >
              <div className="px-6 py-4 flex flex-col gap-1">
                {/* Children are rendered too: the desktop dropdown is hover-only,
                    so without this /portfolio is unreachable from a phone. */}
                {nav.map((item) => (
                  <div key={item.key}>
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block rounded py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 ${onDark ? 'text-white focus-visible:ring-flow-lime' : 'text-flow-green focus-visible:ring-flow-green'}`}
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <div className="ms-2 flex flex-col border-s border-flow-border ps-3">
                        {item.children
                          // The services dropdown all points at /#services, which the
                          // parent link already covers — skip pure duplicates.
                          .filter((child) => child.href !== item.href)
                          .map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMenuOpen(false)}
                              className={`rounded py-2 text-sm focus-visible:outline-none focus-visible:ring-2 ${onDark ? 'text-white/70 focus-visible:ring-flow-lime' : 'text-flow-text-muted focus-visible:ring-flow-green'}`}
                            >
                              {child.label}
                            </Link>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="pt-1"><LanguageSwitcher tone={onDark ? 'light' : 'dark'} /></div>
                <Link
                  href="/#contact"
                  onClick={() => setMenuOpen(false)}
                  className={`mt-2 rounded-full px-5 py-2.5 text-center text-sm font-semibold transition-colors ${onDark ? 'bg-flow-lime text-flow-green hover:bg-flow-lime-hover' : 'bg-flow-green text-flow-bg hover:bg-flow-green-hover'}`}
                >
                  {t('cta')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </nav>
  )
}

Navbar.displayName = 'Navbar'
