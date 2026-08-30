'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { spring } from '@/lib/animations'

type Tag = 'h1' | 'h2' | 'h3' | 'div'

interface RevealHeadingProps {
  text: string
  /** Words to render with the gradient accent (matched case-insensitively). */
  accent?: string[]
  as?: Tag
  className?: string
  /** Reveal on scroll-into-view (default) vs. immediately on mount. */
  whileInView?: boolean
  /**
   * Which way the accent steps off the surrounding text. `dark` (default) is
   * for headings on a light ground; `light` for headings on a dark panel.
   */
  accentTone?: 'dark' | 'light'
}

const norm = (w: string) => w.toLowerCase().replace(/[.,—?!]/g, '')

/**
 * Editorial heading whose words rise from behind a mask, one after another.
 * Falls back to a static heading under prefers-reduced-motion.
 *
 * The scroll trigger is measured on the heading element, never on the words.
 * Each word starts translated a full line below its own `overflow: hidden`
 * mask, and IntersectionObserver applies ancestor clipping when it computes an
 * intersection — so a word in its starting position has an empty intersection
 * rect and can never satisfy a visibility threshold. Putting `whileInView` on
 * the words themselves deadlocks: the word has to be visible to animate, and
 * has to animate to become visible. The result is a heading that is present
 * and selectable but renders as blank space.
 *
 * Observing the unclipped heading and driving the words from that flag keeps
 * every word's independent delay while removing the deadlock entirely.
 */
export default function RevealHeading({
  text,
  accent = [],
  as: Tag = 'h2',
  className = '',
  whileInView = true,
  accentTone = 'dark',
}: RevealHeadingProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLHeadingElement>(null)
  // `amount: 'some'` — any sliver of the heading counts. The heading itself is
  // never clipped, so this is a threshold it can actually reach.
  const inView = useInView(ref, { once: true, amount: 'some' })
  const accentSet = new Set(accent.map(norm))
  const words = text.split(' ')
  const accentClass = accentTone === 'light' ? 'heading-accent-light' : 'heading-accent'

  if (reduced) {
    return (
      <Tag className={className}>
        {words.map((word, i) => (
          <span key={i} className={accentSet.has(norm(word)) ? accentClass : undefined}>
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </Tag>
    )
  }

  const shown = whileInView ? inView : true

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-flex overflow-hidden align-bottom"
          style={{ paddingBottom: '0.08em', marginBottom: '-0.08em' }}
        >
          <motion.span
            initial={{ y: '110%' }}
            animate={{ y: shown ? '0%' : '110%' }}
            transition={{ ...spring.ui, duration: 0.5, delay: i * 0.05 }}
            className={`inline-block ${accentSet.has(norm(word)) ? accentClass : ''}`}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? <span>&nbsp;</span> : null}
        </span>
      ))}
    </Tag>
  )
}
