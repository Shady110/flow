'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useScrolled } from '@/hooks/useScrolled'

interface NavLink {
  label: string
  href: string
}

const links: NavLink[] = [
  { label: 'Services', href: '/#services' },
  { label: 'How It Works', href: '/#workflow' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Contact', href: '/#contact' },
]

export default function Navbar() {
  const scrolled = useScrolled(20)
  const [menuOpen, setMenuOpen] = useState<boolean>(false)

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Image
          src="/assets/Dark%20Green%20type%20-%20transparent.png"
          alt="FLOW Agency"
          width={200}
          height={72}
          className="object-contain"
          priority
          sizes="200px"
        />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-flow-green hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-green focus-visible:ring-offset-2 rounded"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            className="bg-flow-lime text-flow-green text-sm font-semibold px-5 py-2 rounded-full hover:bg-flow-lime-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-lime focus-visible:ring-offset-2"
          >
            Start Your Flow
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden flex flex-col justify-center gap-1.5 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-green focus-visible:ring-offset-2 rounded"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className="block w-6 h-0.5 bg-flow-green" />
          <span className="block w-6 h-0.5 bg-flow-green" />
          <span className="block w-4 h-0.5 bg-flow-green" />
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-flow-border px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-flow-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-green focus-visible:ring-offset-2 rounded"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            onClick={() => setMenuOpen(false)}
            className="bg-flow-lime text-flow-green text-sm font-semibold px-5 py-2.5 rounded-full text-center hover:bg-flow-lime-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-lime focus-visible:ring-offset-2"
          >
            Start Your Flow
          </Link>
        </div>
      )}
    </nav>
  )
}

Navbar.displayName = 'Navbar'
