'use client'
import { useState, useMemo } from 'react'
import type { Category } from '@/data/portfolioData'
import { getAllImagesFromCategory } from '@/data/portfolioData'
import type { PortfolioImage } from '@/data/portfolioData'

interface UsePortfolioFilterReturn {
  activeCategoryId: string
  activeSubcategoryId: string
  visibleImages: PortfolioImage[]
  handleCategoryChange: (id: string) => void
  handleSubcategoryChange: (id: string) => void
}

export function usePortfolioFilter(data: Category[]): UsePortfolioFilterReturn {
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all')
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string>('all')

  const activeCategory = data.find((c) => c.id === activeCategoryId) ?? null

  const visibleImages = useMemo((): PortfolioImage[] => {
    if (activeCategoryId === 'all') {
      return data.flatMap((cat) => getAllImagesFromCategory(cat))
    }
    if (!activeCategory) return []
    if (activeSubcategoryId === 'all') return getAllImagesFromCategory(activeCategory)
    const sub = activeCategory.subcategories.find((s) => s.id === activeSubcategoryId)
    return sub?.images ?? []
  }, [activeCategoryId, activeSubcategoryId, activeCategory, data])

  function handleCategoryChange(id: string): void {
    setActiveCategoryId(id)
    setActiveSubcategoryId('all')
  }

  function handleSubcategoryChange(id: string): void {
    setActiveSubcategoryId(id)
  }

  return {
    activeCategoryId,
    activeSubcategoryId,
    visibleImages,
    handleCategoryChange,
    handleSubcategoryChange,
  }
}
