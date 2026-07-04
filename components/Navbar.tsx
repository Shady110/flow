'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { useScrolled } from '@/hooks/useScrolled'
import MagneticButton from './ui/MagneticButton'

interface DropdownItem {
  label: string
  href: string
  desc?: string
}
interface NavItem {
  label: string
  href: string
  children?: DropdownItem[]
}

const nav: NavItem[] = [
  {
    label: 'Services',
    href: '/#services',
    children: [
      { label: 'Product Content Creation', href: '/#services', desc: 'Studio photography + copy' },
      { label: 'Listing Optimization', href: '/#services', desc: 'Rank higher, convert better' },
      { label: 'Marketplace Management', href: '/#services', desc: 'Catalog & uploads handled' },
      { label: 'Account Management', href: '/#services', desc: 'Full seller-account ownership' },
    ],
  },
  {
    label: 'Work',
    href: '/#work',
    children: [
      { label: 'Fashion & Apparel', href: '/portfolio' },
      { label: 'Electronics', href: '/portfolio' },
      { label: 'Cosmetics & Beauty', href: '/portfolio' },
      { label: 'View full portfolio →', href: '/portfolio' },
    ],
  },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Team', href: '/#team' },
  { label: 'FAQ', href: '/#faq' },
]

export default function Navbar() {
  const scrolled = useScrolled(20)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed z-50 top-0 inset-x-0 md:top-4 md:inset-x-6 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:w-full lg:max-w-5xl"
    >
      <div
        className={`relative text-white transition-all duration-300 md:rounded-full border border-white/10 ${
          scrolled ? 'shadow-[var(--shadow-glow-green)]' : 'shadow-[var(--shadow-md)]'
        }`}
        style={{ backgroundImage: 'var(--gradient-dark-panel)' }}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <div className="max-w-7xl mx-auto pl-5 pr-3 md:pl-6 md:pr-3 h-16 md:h-14 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-lime rounded">
            <Image
              src="/assets/White%20type%20-%20transparent.png"
              alt="FLOW Agency"
              width={200}
              height={72}
              className="object-contain h-9 md:h-10 w-auto"
              priority
              sizes="200px"
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {nav.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.children ? item.label : null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white transition-colors px-3 py-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-lime"
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        openDropdown === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </Link>

                {item.children && (
                  <AnimatePresence>
                    {openDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute left-0 top-full pt-3 w-64"
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
            <span className="hidden lg:flex items-center gap-1.5 text-xs text-white/70">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-flow-lime opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-flow-lime" />
              </span>
              2 spots left
            </span>
            <MagneticButton strength={0.2}>
              <Link
                href="/#contact"
                className="block bg-flow-lime text-flow-green text-sm font-semibold px-5 py-2 rounded-full hover:bg-flow-lime-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-lime shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-glow-lime)]"
              >
                Start Your Flow
              </Link>
            </MagneticButton>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden flex flex-col justify-center gap-1.5 p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-lime rounded"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="block w-6 h-0.5 bg-white" />
            <span className="block w-6 h-0.5 bg-white" />
            <span className="block w-4 h-0.5 bg-white" />
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden border-t border-white/10"
            >
              <div className="px-6 py-4 flex flex-col gap-1">
                {nav.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-medium text-white/85 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-lime rounded"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/#contact"
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 bg-flow-lime text-flow-green text-sm font-semibold px-5 py-2.5 rounded-full text-center hover:bg-flow-lime-hover transition-colors"
                >
                  Start Your Flow
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

Navbar.displayName = 'Navbar'
