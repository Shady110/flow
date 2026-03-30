'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { PortfolioImage } from '@/data/portfolioData'

interface Props {
  images: PortfolioImage[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export default function LightboxModal({ images, currentIndex, onClose, onPrev, onNext }: Props) {
  const [direction, setDirection] = useState(0)
  const image = images[currentIndex]

  function prev() {
    if (currentIndex === 0) return
    setDirection(-1)
    onPrev()
  }

  function next() {
    if (currentIndex === images.length - 1) return
    setDirection(1)
    onNext()
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') {
        if (currentIndex === 0) return
        setDirection(-1)
        onPrev()
      }
      if (e.key === 'ArrowRight') {
        if (currentIndex === images.length - 1) return
        setDirection(1)
        onNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentIndex, images.length, onClose, onPrev, onNext])

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close image viewer"
        className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-flow-lime hover:text-flow-green text-white flex items-center justify-center transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <X size={20} />
      </button>

      {/* Prev */}
      <button
        onClick={e => { e.stopPropagation(); prev() }}
        disabled={currentIndex === 0}
        aria-label="Previous image"
        className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors disabled:opacity-20 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Image */}
      <div className="relative max-h-[85vh] max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="max-h-[85vh] max-w-[90vw] w-auto h-auto object-contain rounded-xl"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next */}
      <button
        onClick={e => { e.stopPropagation(); next() }}
        disabled={currentIndex === images.length - 1}
        aria-label="Next image"
        className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors disabled:opacity-20 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <ChevronRight size={24} />
      </button>

      {/* Counter */}
      <div
        aria-live="polite"
        className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium"
      >
        {currentIndex + 1} / {images.length}
      </div>
    </motion.div>
  )
}
