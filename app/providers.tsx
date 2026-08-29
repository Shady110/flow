'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    /* `reducedMotion="user"` makes every framer animation in the app honour
       prefers-reduced-motion: transform animations (x/y/scale/rotate) are
       skipped to their end value while opacity still animates — which is
       exactly the wanted degradation, a cross-fade instead of a slide.
       Reduced motion does not mean no feedback.

       This matters because the global CSS kill-switch in globals.css only
       reaches CSS animations; framer writes inline transforms and ignores it.
       One provider covers every motion component, including ones written
       later, instead of a per-component guard that someone will forget.
       Components that must change their *markup* (RevealHeading, Reveal,
       Counter, the pinned workflow reel) still read the hook directly. */
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MotionConfig>
  )
}
