'use client'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useReducedMotion } from '@/lib/useReducedMotion'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  /** Max tilt in degrees. */
  intensity?: number
}

/**
 * Subtle pointer-driven 3D tilt wrapper. Reuses the spring pattern from
 * MagneticButton. No-ops under prefers-reduced-motion.
 */
export default function TiltCard({ children, className = '', intensity = 8 }: TiltCardProps) {
  const reduced = useReducedMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(py, [0, 1], [intensity, -intensity]), {
    stiffness: 200,
    damping: 20,
  })
  const rotateY = useSpring(useTransform(px, [0, 1], [-intensity, intensity]), {
    stiffness: 200,
    damping: 20,
  })

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - rect.left) / rect.width)
    py.set((e.clientY - rect.top) / rect.height)
  }

  function handleLeave() {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
