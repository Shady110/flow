'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ZoomIn } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { spring } from '@/lib/animations'
import { PortfolioImage } from '@/data/portfolioData'
import PortfolioEmpty from './PortfolioEmpty'

interface Props {
  images: PortfolioImage[]
  onImageClick: (index: number) => void
}

export default function ImageGrid({ images, onImageClick }: Props) {
  const t = useTranslations('marketing.portfolio')
  if (images.length === 0) return <PortfolioEmpty />

  return (
    <div>
      <p className="mb-5 text-xs font-medium text-flow-text-muted">
        {t('showing', { count: images.length })}
      </p>

      <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
        <AnimatePresence mode="popLayout">
          {images.map((img, i) => (
            <motion.div
              key={img.id}
              // No `layout` prop: framer's layout engine measures against a
              // normal flow box, but these tiles are laid out by CSS columns,
              // which reflows every tile whenever any one of them changes.
              // The two fight, and the result is jitter.
              data-shot-id={img.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              whileTap={{ scale: 0.97 }}
              transition={{ ...spring.ui, delay: Math.min(i * 0.02, 0.25) }}
              className="group relative mb-3 cursor-pointer break-inside-avoid overflow-hidden rounded-xl"
              onClick={() => onImageClick(i)}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                className="block h-auto w-full transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                loading={i < 8 ? 'eager' : 'lazy'}
                priority={i < 4}
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-flow-green opacity-0 transition-all duration-300 group-hover:opacity-70">
                <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity delay-75 duration-300 group-hover:opacity-100" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
