'use client'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { spring } from '@/lib/animations'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  strength?: number
}

export default function MagneticButton({
  children,
  className = '',
  strength = 0.3,
}: MagneticButtonProps) {
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  // Independent X and Y springs, never one spring on a 2D distance — a single
  // spring desyncs the moment the two axes carry different velocities.
  // Critically damped (damping / 2√stiffness ≈ 1) so the magnet settles on the
  // pointer instead of wobbling past it.
  const springX = useSpring(x, { stiffness: 300, damping: 35 })
  const springY = useSpring(y, { stiffness: 300, damping: 35 })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * strength)
    y.set((e.clientY - rect.top - rect.height / 2) * strength)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      // Feedback on press, not on release. The magnet is pointer-only; this is
      // what gives touch users any acknowledgement at all.
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={spring.snappy}
      className={className || 'inline-block'}
    >
      {children}
    </motion.div>
  )
}
