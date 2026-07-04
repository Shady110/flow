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
  const display = useTransform(spring, (v) => `${prefix}${Math.round(v)}${suffix}`)

  useEffect(() => {
    if (isInView) motionValue.set(value)
  }, [isInView, value, motionValue])

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  )
}
