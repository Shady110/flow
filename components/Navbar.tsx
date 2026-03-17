'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const links = [
    { label: 'Services', href: '/#services' },
    { label: 'How It Works', href: '/#workflow' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Contact', href: '/#contact' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Image
          src="/assets/Dark%20Green%20type%20-%20transparent.png"
          alt="FLOW"
          width={200}
          height={72}
          className="object-contain"
          priority
        />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-flow-green hover:opacity-70 transition-opacity"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            className="bg-flow-lime text-flow-green text-sm font-semibold px-5 py-2 rounded-full hover:bg-flow-lime-hover transition-colors"
          >
            Start Your Flow
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden flex flex-col justify-center gap-1.5 p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
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
              className="text-sm font-medium text-flow-green"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            onClick={() => setMenuOpen(false)}
            className="bg-flow-lime text-flow-green text-sm font-semibold px-5 py-2.5 rounded-full text-center hover:bg-flow-lime-hover transition-colors"
          >
            Start Your Flow
          </Link>
        </div>
      )}
    </nav>
  )
}
