'use client'

import { useEffect, useState } from 'react'

/**
 * The Flow mark filling up from the bottom — the page-load indicator for both
 * products. It stays invisible for `delay` ms so fast navigations never flash
 * it; under prefers-reduced-motion the mark is shown filled and static.
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
      <svg viewBox="0 0 48 48" className="h-14 w-14" aria-hidden="true">
        <defs>
          <clipPath id="flow-loader-mark">
            <path d="M10 6h28v8H20v8h14v8H20v12h-10z" />
          </clipPath>
        </defs>
        <path d="M10 6h28v8H20v8h14v8H20v12h-10z" className="fill-flow-green/15" />
        <g clipPath="url(#flow-loader-mark)">
          <rect x="0" y="0" width="48" height="48" className="flow-loader-fill fill-flow-green" />
        </g>
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )
}
