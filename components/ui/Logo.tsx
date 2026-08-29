import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * The FLOW logo, in one place.
 *
 * Three lockups, three inks. The ratios below are measured from the supplied
 * artwork *after trimming its transparent canvas* — the masters are 6250×6250
 * with the glyph small in the middle, so anything pointed straight at them
 * renders a tiny logo inside a large invisible box. `scripts/` is not involved;
 * the trimmed, size-capped files live in `public/assets/logo/`.
 *
 * Size is set with a height class (`h-7`, `h-10`); width follows from the
 * ratio, so a bare mark and a full lockup at the same height stay optically
 * consistent.
 */
export type LogoVariant = 'mark' | 'wordmark' | 'lockup'
export type LogoTone = 'green' | 'white' | 'black'

/** Intrinsic aspect ratios (width ÷ height) of the trimmed artwork. */
const RATIO: Record<LogoVariant, number> = {
  mark: 0.998,
  wordmark: 2.505,
  lockup: 4.19,
}

const SRC: Record<LogoVariant, Record<LogoTone, string>> = {
  mark: {
    green: '/assets/logo/flow-mark-green.png',
    white: '/assets/logo/flow-mark-white.png',
    black: '/assets/logo/flow-mark-black.png',
  },
  wordmark: {
    green: '/assets/logo/flow-wordmark-green.png',
    white: '/assets/logo/flow-wordmark-white.png',
    black: '/assets/logo/flow-wordmark-black.png',
  },
  lockup: {
    green: '/assets/logo/flow-lockup-green.png',
    white: '/assets/logo/flow-lockup-white.png',
    black: '/assets/logo/flow-lockup-black.png',
  },
}

/** Nominal render height in px; the intrinsic width is derived from it. */
const BASE_HEIGHT = 80

export default function Logo({
  variant = 'lockup',
  tone = 'green',
  className,
  priority = false,
}: {
  variant?: LogoVariant
  tone?: LogoTone
  /** Set the height here (e.g. `h-7`); width follows the ratio. */
  className?: string
  priority?: boolean
}) {
  return (
    <Image
      src={SRC[variant][tone]}
      alt="FLOW Agency"
      width={Math.round(BASE_HEIGHT * RATIO[variant])}
      height={BASE_HEIGHT}
      priority={priority}
      className={cn('w-auto object-contain', className)}
    />
  )
}
