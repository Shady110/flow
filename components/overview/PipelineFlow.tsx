'use client'

import { createRef, useMemo, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { AnimatedBeam } from '@/components/ds/animated-beam'
import { cn } from '@/lib/utils'

/**
 * The pipeline as a flow: one circle per stage with its count, a light beam moving
 * between them. The numbers are plain text; with reduced motion the beams are still lines.
 */
export function PipelineFlow({ steps, label }: { steps: { key: string; label: string; count: number }[]; label: string }) {
  const container = useRef<HTMLDivElement>(null)
  const refs = useMemo(() => steps.map(() => createRef<HTMLDivElement>()), [steps])
  const reduced = useReducedMotion()

  return (
    <div className="overflow-x-auto" role="group" aria-label={label}>
      <div ref={container} className="relative flex min-w-[640px] items-start justify-between gap-2 px-2 py-4">
        {steps.map((s, i) => (
          <div key={s.key} className="relative z-10 flex w-24 flex-col items-center gap-2 text-center">
            <div
              ref={refs[i]}
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full border-2 bg-card font-display text-lg font-bold shadow-[var(--shadow-sm)]',
                s.count > 0 ? 'border-primary text-foreground' : 'border-border text-muted-foreground',
              )}
            >
              <bdi dir="ltr">{s.count}</bdi>
            </div>
            <span className="text-xs leading-tight text-muted-foreground">{s.label}</span>
          </div>
        ))}
        {steps.slice(0, -1).map((s, i) => (
          <AnimatedBeam
            key={s.key}
            containerRef={container}
            fromRef={refs[i]}
            toRef={refs[i + 1]}
            duration={reduced ? 0 : 3}
            repeat={reduced ? 0 : Infinity}
            delay={i * 0.25}
            pathColor="var(--border)"
            pathOpacity={0.9}
            gradientStartColor="#C4F075"
            gradientStopColor="var(--leaf)"
            startYOffset={-14}
            endYOffset={-14}
          />
        ))}
      </div>
    </div>
  )
}
