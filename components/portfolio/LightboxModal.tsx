'use client'
import { useEffect, useState } from 'react'
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { PortfolioImage } from '@/data/portfolioData'
import { spring, project } from '@/lib/animations'
import { useDirection } from '@/lib/useDirection'
import { useReducedMotion } from '@/lib/useReducedMotion'

interface Props {
  images: PortfolioImage[]
  currentIndex: number
  /** Viewport rect of the grid tile this was opened from, for the entry. */
  originRect: DOMRect | null
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

/** Past this projected distance the gesture is a commit, not a nudge. */
const SWIPE_COMMIT = 110
const DISMISS_COMMIT = 150

export default function LightboxModal({
  images,
  currentIndex,
  originRect,
  onClose,
  onPrev,
  onNext,
}: Props) {
  const t = useTranslations('marketing.portfolio')
  const dir = useDirection()
  const reduced = useReducedMotion()
  const [direction, setDirection] = useState(0)
  const image = images[currentIndex]

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // The backdrop thins and the image shrinks as it is pulled away, so the
  // dismissal is legible the whole way through the drag rather than only at
  // the moment it commits.
  const backdropOpacity = useTransform(y, [-320, 0, 320], [0.25, 1, 0.25])
  const dragScale = useTransform(y, [-320, 0, 320], [0.86, 1, 0.86])

  const atFirst = currentIndex === 0
  const atLast = currentIndex === images.length - 1

  function go(delta: -1 | 1) {
    if (delta === -1 && atFirst) return
    if (delta === 1 && atLast) return
    setDirection(delta)
    ;(delta === 1 ? onNext : onPrev)()
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      // Arrow keys follow the reading direction: in Arabic the next image
      // lives to the left, so ArrowLeft advances.
      if (e.key === 'ArrowLeft') go(dir === 1 ? -1 : 1)
      if (e.key === 'ArrowRight') go(dir === 1 ? 1 : -1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, images.length, onClose, onPrev, onNext, dir])

  function handleDragEnd(_: unknown, info: PanInfo) {
    const { offset, velocity } = info

    // Whichever axis the gesture actually committed to wins; testing both
    // against a threshold lets a sloppy diagonal fire two things at once.
    if (Math.abs(offset.y) > Math.abs(offset.x)) {
      const projected = offset.y + project(velocity.y)
      if (Math.abs(projected) > DISMISS_COMMIT) {
        onClose()
        return
      }
      animate(y, 0, { ...spring.sheet, velocity: velocity.y })
      animate(x, 0, spring.sheet)
      return
    }

    // Logical, not physical: dragging content to the left means "next" in
    // English and "previous" in Arabic.
    const projected = (offset.x + project(velocity.x)) * dir
    const wantsNext = projected < -SWIPE_COMMIT
    const wantsPrev = projected > SWIPE_COMMIT

    if (wantsNext && !atLast) go(1)
    else if (wantsPrev && !atFirst) go(-1)

    // Snap home carrying the release velocity, so there is no seam between
    // the finger letting go and the animation taking over.
    animate(x, 0, { ...spring.sheet, velocity: velocity.x })
    animate(y, 0, spring.sheet)
  }

  // Entry transform: start from the tile that was clicked. Approximating the
  // final image box by the viewport keeps this to a few lines and reads
  // correctly at every size.
  // ponytail: approximate scale from viewport width; measure the settled image
  // box if the entry ever looks off on extreme aspect ratios.
  const entry =
    originRect && !reduced
      ? {
          x: originRect.left + originRect.width / 2 - window.innerWidth / 2,
          y: originRect.top + originRect.height / 2 - window.innerHeight / 2,
          scale: originRect.width / (window.innerWidth * 0.9),
          opacity: 0,
        }
      : { opacity: 0, scale: reduced ? 1 : 0.96 }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={spring.ui}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* The backdrop materialises — blur and tint arrive together, so it reads
          as a surface being placed rather than a black box fading up. */}
      <motion.div
        aria-hidden="true"
        initial={{ backdropFilter: 'blur(0px)', opacity: 0 }}
        animate={{ backdropFilter: 'blur(6px)', opacity: 1 }}
        exit={{ backdropFilter: 'blur(0px)', opacity: 0 }}
        transition={spring.ui}
        style={{ opacity: backdropOpacity }}
        className="absolute inset-0 bg-black/90"
      />

      {/* Close */}
      <button
        onClick={onClose}
        aria-label={t('closeViewer')}
        className="absolute end-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-flow-lime hover:text-flow-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <X size={20} />
      </button>

      {/* Prev — physically on the start edge, which mirrors in Arabic, and the
          chevron flips with it. */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          go(-1)
        }}
        disabled={atFirst}
        aria-label={t('previous')}
        className="absolute start-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <ChevronLeft size={24} className="rtl:-scale-x-100" />
      </button>

      {/* Image — the draggable surface */}
      <motion.div
        drag={reduced ? false : true}
        dragMomentum={false}
        dragElastic={0.45}
        onDragEnd={handleDragEnd}
        style={{ x, y, scale: dragScale }}
        initial={entry}
        animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={spring.sheet}
        className="relative z-10 max-h-[85vh] max-w-[90vw] cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 * dir }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 * dir }}
            transition={spring.snappy}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="pointer-events-none h-auto max-h-[85vh] w-auto max-w-[90vw] rounded-xl object-contain"
              priority
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Next */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          go(1)
        }}
        disabled={atLast}
        aria-label={t('next')}
        className="absolute end-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <ChevronRight size={24} className="rtl:-scale-x-100" />
      </button>

      {/* Counter */}
      <div
        aria-live="polite"
        className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 text-sm font-medium text-white/60"
      >
        {currentIndex + 1} / {images.length}
      </div>
    </motion.div>
  )
}
