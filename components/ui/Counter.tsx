'use client'
import { useEffect, useRef } from 'react'
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface CounterProps {
  value: number
  prefix?: string
  suffix?: string
  className?: string
}

export default function Counter({ value, prefix = '', suffix = '', className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { stiffness: 60, damping: 20 })
  // Thousands separators so a plan price reads like the struck-through
  // compare-at price next to it (8,000 EGP — not 8000 EGP).
  const display = useTransform(
    spring,
    (v) => `${prefix}${Math.round(v).toLocaleString('en-US')}${suffix}`,
  )

  useEffect(() => {
    if (isInView) motionValue.set(value)
  }, [isInView, value, motionValue])

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  )
}
