'use client'
import { useState, useEffect } from 'react'

export function useScrolled(threshold = 20): boolean {
  const [scrolled, setScrolled] = useState<boolean>(false)

  useEffect(() => {
    const handler = (): void => {
      setScrolled(window.scrollY > threshold)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [threshold])

  return scrolled
}
