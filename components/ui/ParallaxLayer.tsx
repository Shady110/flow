'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useReducedMotion } from '@/lib/useReducedMotion'

interface ParallaxLayerProps {
  children: React.ReactNode
  speed?: number
  className?: string
}

export default function ParallaxLayer({ children, speed = 0.3, className }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [-50 * speed, 50 * speed]
  )

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}
