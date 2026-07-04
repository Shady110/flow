'use client'
import { motion, useScroll, useSpring } from 'framer-motion'

/**
 * Fixed page-scroll progress bar pinned to the very top of the viewport.
 * Sits above the navbar (z-[60]) and reads total document scroll.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[60] h-0.5 origin-left bg-flow-lime"
    />
  )
}
