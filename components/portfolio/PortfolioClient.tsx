'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { spring } from '@/lib/animations'
import { Category, getAllImagesFromCategory } from '@/data/portfolioData'
import PortfolioHero from './PortfolioHero'
import CategoryTabs from './CategoryTabs'
import SubcategoryFilter from './SubcategoryFilter'
import ImageGrid from './ImageGrid'
import LightboxModal from './LightboxModal'

export default function PortfolioClient({ data }: { data: Category[] }) {
  const [activeCategoryId, setActiveCategoryId] = useState('all')
  const [activeSubcategoryId, setActiveSubcategoryId] = useState('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  // Viewport rect of the tile the viewer was opened from, so it can emerge
  // from where it came rather than appearing from nowhere in the middle.
  const [originRect, setOriginRect] = useState<DOMRect | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const activeCategory = data.find(c => c.id === activeCategoryId) ?? null

  // Deep-link support: /portfolio#<category-id> opens that category directly
  // (used by the landing-page portfolio tiles and the navbar "Work" menu).
  useEffect(() => {
    const applyHash = (scroll: boolean) => {
      const id = window.location.hash.replace('#', '')
      if (id && data.some(c => c.id === id)) {
        setActiveCategoryId(id)
        setActiveSubcategoryId('all')
        if (scroll) {
          requestAnimationFrame(() =>
            gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          )
        }
      }
    }
    applyHash(true)
    const onHash = () => applyHash(true)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [data])

  const visibleImages = useMemo(() => {
    if (activeCategoryId === 'all') {
      return data.flatMap(cat => getAllImagesFromCategory(cat))
    }
    if (!activeCategory) return []
    if (activeSubcategoryId === 'all') return getAllImagesFromCategory(activeCategory)
    const sub = activeCategory.subcategories.find(s => s.id === activeSubcategoryId)
    return sub?.images ?? []
  }, [activeCategoryId, activeSubcategoryId, activeCategory, data])

  const totalImages = data.flatMap(c => getAllImagesFromCategory(c)).length

  function openLightbox(index: number) {
    const id = visibleImages[index]?.id
    const tile = id
      ? document.querySelector<HTMLElement>(`[data-shot-id="${CSS.escape(id)}"]`)
      : null
    setOriginRect(tile?.getBoundingClientRect() ?? null)
    setLightboxIndex(index)
  }

  function handleCategoryChange(id: string) {
    setActiveCategoryId(id)
    setActiveSubcategoryId('all')
    // Keep the URL shareable/back-friendly without adding history entries.
    const url = id === 'all' ? window.location.pathname : `#${id}`
    window.history.replaceState(null, '', url)
  }

  return (
    <div className="bg-flow-bg">
      <PortfolioHero totalImages={totalImages} totalCategories={data.length} />

      {/* Sticky filter bar */}
      <div
        ref={gridRef}
        className="chrome-light scroll-edge sticky top-16 z-30 border-x-0 border-t-0 md:top-20"
      >
        <div className="max-w-7xl mx-auto px-6">
          <CategoryTabs
            categories={data}
            activeId={activeCategoryId}
            onChange={handleCategoryChange}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {activeCategory && (
            <motion.div
              key={activeCategoryId}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={spring.snappy}
            >
              <SubcategoryFilter
                subcategories={activeCategory.subcategories}
                activeId={activeSubcategoryId}
                onChange={setActiveSubcategoryId}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ImageGrid images={visibleImages} onImageClick={openLightbox} />
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <LightboxModal
            images={visibleImages}
            currentIndex={lightboxIndex}
            originRect={originRect}
            onClose={() => setLightboxIndex(null)}
            onPrev={() => setLightboxIndex(i => Math.max(0, (i ?? 0) - 1))}
            onNext={() => setLightboxIndex(i => Math.min(visibleImages.length - 1, (i ?? 0) + 1))}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
