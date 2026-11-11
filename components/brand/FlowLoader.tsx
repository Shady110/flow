'use client'

import { useEffect, useState } from 'react'

/**
 * The page-load indicator for both products: a plain ring in Flow green, no logo
 * or letter. It stays invisible for `delay` ms so fast navigations never flash it;
 * under prefers-reduced-motion the ring is shown still.
 */
export function FlowLoader({
  delay = 150,
  label = 'Loading',
  className = '',
}: {
  delay?: number
  label?: string
  className?: string
}) {
  const [shown, setShown] = useState(delay === 0)
  useEffect(() => {
    if (delay === 0) return
    const id = setTimeout(() => setShown(true), delay)
    return () => clearTimeout(id)
  }, [delay])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`flex min-h-[50vh] items-center justify-center transition-opacity duration-200 ${shown ? 'opacity-100' : 'opacity-0'} ${className}`}
    >
      <svg viewBox="0 0 48 48" className="flow-loader-ring h-12 w-12" aria-hidden="true">
        <circle cx="24" cy="24" r="19" fill="none" strokeWidth="4" className="stroke-flow-green/15" />
        <circle cx="24" cy="24" r="19" fill="none" strokeWidth="4" strokeLinecap="round" strokeDasharray="30 90" className="stroke-flow-green" />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )
}
