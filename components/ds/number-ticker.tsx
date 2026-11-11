"use client"

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react"
import { useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion"

import { cn } from "@/lib/utils"

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number
  /** Where the count-up begins. Defaults to 80% of `value`, never 0, so the real number is always close to what shows. */
  startValue?: number
  delay?: number
  decimalPlaces?: number
}

const format = (n: number, decimalPlaces: number) =>
  Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(Number(n.toFixed(decimalPlaces)))

/**
 * Magic UI number ticker, adapted: the server renders the real number (nothing is
 * hidden on first paint), the count-up only eases the last stretch into view, and
 * it does not animate at all under prefers-reduced-motion.
 */
export function NumberTicker({
  value,
  startValue,
  delay = 0,
  className,
  decimalPlaces = 0,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  const from = startValue ?? Math.round(value * 0.8)
  const motionValue = useMotionValue(from)
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 })
  const isInView = useInView(ref, { once: true, margin: "0px" })

  useEffect(() => {
    if (!isInView || reduced) return
    const timer = setTimeout(() => motionValue.set(value), delay * 1000)
    return () => clearTimeout(timer)
  }, [motionValue, isInView, reduced, delay, value])

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current && !reduced) ref.current.textContent = format(latest, decimalPlaces)
      }),
    [springValue, decimalPlaces, reduced]
  )

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)} {...props}>
      {format(value, decimalPlaces)}
    </span>
  )
}
