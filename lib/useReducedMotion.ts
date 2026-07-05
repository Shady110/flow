'use client'
import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(callback: () => void): () => void {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches
}

/**
 * Hydration-safe reduced-motion preference.
 *
 * The server snapshot is always `false`, so the SSR markup and the first client
 * render agree (React reconciles the real preference after commit without a
 * hydration mismatch). This matters for components that branch their markup on
 * it, e.g. RevealHeading.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
