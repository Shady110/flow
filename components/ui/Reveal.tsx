'use client'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { spring } from '@/lib/animations'

type Props = {
  children: React.ReactNode
  /** Seconds of stagger before this element starts. */
  delay?: number
  /** Travel distance in px. 0 gives a pure fade. */
  y?: number
  /** Fraction of the element that must be visible before it fires. Prefer the
   *  default: see the note on the component about tall elements. */
  amount?: number | 'some' | 'all'
  as?: 'div' | 'section' | 'li' | 'p' | 'span'
  className?: string
}

/**
 * Reveal-on-scroll.
 *
 * Twelve sections each inlined the same five-line `variants / initial /
 * whileInView / viewport / custom` block; this is that block, once.
 *
 * Under reduced motion it renders a plain element with no motion wrapper at
 * all — not a shortened animation. The failure mode that matters here is a
 * reveal that never fires and strands its content at `opacity: 0`, so the
 * reduced path must not depend on an animation running to become visible, and
 * the trigger below must be one every element can actually reach.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  amount = 'some',
  as = 'div',
  className,
}: Props) {
  const reduced = useReducedMotion()
  const Tag = motion[as]

  if (reduced) {
    const Plain = as
    return <Plain className={className}>{children}</Plain>
  }

  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      // `some` plus a negative bottom margin, rather than a fraction of the
      // element. A numeric amount is unreachable for anything taller than
      // (viewport ÷ amount) — 20% of a 5000px column is 1000px, which never
      // fits a 900px viewport, and the reveal then never fires and strands its
      // content at opacity 0. This triggers once the element's top crosses
      // 120px above the fold, which holds at any height.
      viewport={{ once: true, amount, margin: '0px 0px -120px 0px' }}
      transition={{ ...spring.ui, delay }}
      className={className}
    >
      {children}
    </Tag>
  )
}
