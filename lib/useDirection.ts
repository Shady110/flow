'use client'
import { useSyncExternalStore } from 'react'

/** +1 in LTR, -1 in RTL. Multiply any horizontal motion value by it. */
export type Direction = 1 | -1

function subscribe(callback: () => void): () => void {
  // `dir` is set once on <html> from the locale cookie and only changes on a
  // full navigation, but observing it keeps this correct if that ever changes.
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] })
  return () => observer.disconnect()
}

function getSnapshot(): Direction {
  return document.documentElement.dir === 'rtl' ? -1 : 1
}

/**
 * Reading direction as a signed multiplier.
 *
 * Horizontal motion written as a raw pixel offset is direction-blind: a panel
 * that slides in from `x: 40` enters from the right in Arabic too, against the
 * reading direction, and a swipe that means "next" in English means "previous"
 * in Arabic. Multiply the offset — or the sign of a drag — by this.
 *
 * Server snapshot is `1` so SSR markup and first client render agree; the real
 * value lands after commit. Components that branch their *markup* on direction
 * should use logical CSS properties instead, which need no JS at all.
 */
export function useDirection(): Direction {
  return useSyncExternalStore(subscribe, getSnapshot, () => 1)
}
