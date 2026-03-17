'use client'
import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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

  const activeCategory = data.find(c => c.id === activeCategoryId) ?? null

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

  function handleCategoryChange(id: string) {
    setActiveCategoryId(id)
    setActiveSubcategoryId('all')
  }

  return (
    <div className="min-h-screen bg-white">
      <PortfolioHero totalImages={totalImages} totalCategories={data.length} />

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-flow-border">
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
              transition={{ duration: 0.2 }}
            >
              <SubcategoryFilter
                subcategories={activeCategory.subcategories}
                activeId={activeSubcategoryId}
                onChange={setActiveSubcategoryId}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ImageGrid
          images={visibleImages}
          onImageClick={setLightboxIndex}
        />
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <LightboxModal
            images={visibleImages}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onPrev={() => setLightboxIndex(i => Math.max(0, (i ?? 0) - 1))}
            onNext={() => setLightboxIndex(i => Math.min(visibleImages.length - 1, (i ?? 0) + 1))}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
