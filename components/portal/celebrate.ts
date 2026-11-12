/**
 * A short confetti burst for finishing something (signing the contract). Loaded
 * only when needed and skipped entirely for people who asked for less motion.
 */
export async function celebrate(): Promise<void> {
  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const confetti = (await import('canvas-confetti')).default
  confetti({ particleCount: 140, spread: 80, startVelocity: 38, origin: { y: 0.75 }, disableForReducedMotion: true })
}
