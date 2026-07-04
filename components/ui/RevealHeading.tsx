'use client'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/useReducedMotion'

type Tag = 'h1' | 'h2' | 'h3' | 'div'

interface RevealHeadingProps {
  text: string
  /** Words to render with the gradient accent (matched case-insensitively). */
  accent?: string[]
  as?: Tag
  className?: string
  /** Reveal on scroll-into-view (default) vs. immediately on mount. */
  whileInView?: boolean
}

const EASE = [0.16, 1, 0.3, 1] as const
const norm = (w: string) => w.toLowerCase().replace(/[.,—?!]/g, '')

/**
 * Editorial heading whose words rise from behind a mask, one after another.
 * Each word animates independently (no parent→child variant propagation) so it
 * fires reliably whether in view on mount or scrolled to later. Falls back to a
 * static heading under prefers-reduced-motion.
 */
export default function RevealHeading({
  text,
  accent = [],
  as: Tag = 'h2',
  className = '',
  whileInView = true,
}: RevealHeadingProps) {
  const reduced = useReducedMotion()
  const accentSet = new Set(accent.map(norm))
  const words = text.split(' ')

  if (reduced) {
    return (
      <Tag className={className}>
        {words.map((word, i) => (
          <span key={i} className={accentSet.has(norm(word)) ? 'text-gradient' : undefined}>
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </Tag>
    )
  }

  const motionProps = (i: number) =>
    whileInView
      ? {
          initial: { y: '110%' as const },
          whileInView: { y: '0%' as const },
          viewport: { once: true, amount: 0.3 },
          transition: { duration: 0.7, ease: EASE, delay: i * 0.05 },
        }
      : {
          initial: { y: '110%' as const },
          animate: { y: '0%' as const },
          transition: { duration: 0.7, ease: EASE, delay: i * 0.05 },
        }

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-flex overflow-hidden align-bottom"
          style={{ paddingBottom: '0.08em', marginBottom: '-0.08em' }}
        >
          <motion.span
            {...motionProps(i)}
            className={`inline-block ${accentSet.has(norm(word)) ? 'text-gradient' : ''}`}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? <span>&nbsp;</span> : null}
        </span>
      ))}
    </Tag>
  )
}
