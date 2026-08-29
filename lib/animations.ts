import type { Variants, Transition } from 'framer-motion'

/**
 * Springs, not durations.
 *
 * A fixed-duration tween cannot respond to new input: interrupt it and it
 * either finishes first or jumps. A spring re-targets from wherever it
 * currently is, carrying its velocity, which is what makes an interface
 * grabbable mid-flight. Everything a user can touch uses one of these.
 *
 * Framer's `{ bounce, duration }` spring API maps onto Apple's two designer-
 * facing parameters: `bounce` is damping ratio inverted (0 = critically
 * damped, no overshoot), `duration` is *response* — how fast it reaches the
 * target — not a fixed runtime. The spring settles when it settles.
 *
 * Bounce is not decoration. Overshoot belongs to motion the user threw; a menu
 * that merely faded in has no momentum to express, and bouncing it reads as a
 * glitch. Default to `ui` and reach for `momentum` only after a gesture.
 */
export const spring = {
  /** Critically damped. The default for anything without a gesture behind it. */
  ui: { type: 'spring', bounce: 0, duration: 0.4 },
  /** Slight overshoot — only after a flick, throw, or drag release. */
  momentum: { type: 'spring', bounce: 0.2, duration: 0.4 },
  /** Drawers, sheets, the lightbox. */
  sheet: { type: 'spring', bounce: 0.2, duration: 0.3 },
  /** Taps, segmented-control indicators — fast enough to feel instant. */
  snappy: { type: 'spring', bounce: 0, duration: 0.25 },
} satisfies Record<string, Transition>

/**
 * Where a flick would come to rest, given its release velocity — the same
 * exponential decay that governs scroll deceleration. Snap to the target
 * nearest *this* point rather than the one nearest the release point, and a
 * flick throws the element instead of nudging it.
 *
 * From Apple's `Designing Fluid Interfaces` sample code. Note this is not the
 * textbook `v²/2a`; that curve feels wrong next to native scrolling.
 *
 * @param velocity px/s at release
 * @param decelerationRate 0.998 for normal scroll feel, 0.99 for snappier
 * @returns signed distance travelled beyond the release point, in px
 */
export function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...spring.ui, delay: i * 0.08 },
  }),
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
}

export const revealUp: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { ...spring.ui, duration: 0.55 },
  },
}

/** Soft image/tile reveal used across the portfolio + team grids. */
export const tileReveal: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...spring.ui, delay: i * 0.05 },
  }),
}
