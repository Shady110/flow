'use client'
import { useState, useCallback } from 'react'

interface UseLightboxReturn {
  index: number | null
  isOpen: boolean
  open: (index: number) => void
  close: () => void
  prev: () => void
  next: (total: number) => void
}

export function useLightbox(): UseLightboxReturn {
  const [index, setIndex] = useState<number | null>(null)

  const open = useCallback((i: number): void => setIndex(i), [])
  const close = useCallback((): void => setIndex(null), [])
  const prev = useCallback((): void =>
    setIndex((i) => (i !== null ? Math.max(0, i - 1) : null)), [])
  const next = useCallback((total: number): void =>
    setIndex((i) => (i !== null ? Math.min(total - 1, i + 1) : null)), [])

  return { index, isOpen: index !== null, open, close, prev, next }
}
