'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ZoomIn } from 'lucide-react'
import { PortfolioImage } from '@/data/portfolioData'
import PortfolioEmpty from './PortfolioEmpty'

interface Props {
  images: PortfolioImage[]
  onImageClick: (index: number) => void
}

export default function ImageGrid({ images, onImageClick }: Props) {
  if (images.length === 0) return <PortfolioEmpty />

  return (
    <div>
      <p className="text-xs font-medium text-flow-text-muted mb-5">
        Showing {images.length} photo{images.length !== 1 ? 's' : ''}
      </p>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
        <AnimatePresence mode="popLayout">
          {images.map((img, i) => (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
              className="break-inside-avoid mb-3 rounded-xl overflow-hidden relative group cursor-pointer"
              onClick={() => onImageClick(i)}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                className="w-full h-auto block transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                loading={i < 8 ? 'eager' : 'lazy'}
                priority={i < 4}
              />
              <div className="absolute inset-0 bg-flow-green opacity-0 group-hover:opacity-70 transition-all duration-300 rounded-xl flex items-center justify-center">
                <ZoomIn className="text-white w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
