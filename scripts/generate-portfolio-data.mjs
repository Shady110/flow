// scripts/generate-portfolio-data.mjs
// Run: node scripts/generate-portfolio-data.mjs

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const portfolioRoot = path.join(__dirname, '../public/assets/portfolio')
const outputPath = path.join(__dirname, '../data/portfolioData.ts')

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif']

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function isImage(filename) {
  return IMAGE_EXTENSIONS.includes(path.extname(filename).toLowerCase())
}

// Encode each path segment individually to handle spaces and special chars
function encodePath(rawPath) {
  return rawPath.split('/').map(segment => encodeURIComponent(segment)).join('/')
}

const categories = fs.readdirSync(portfolioRoot)
  .filter(f => fs.statSync(path.join(portfolioRoot, f)).isDirectory())
  .sort()
  .map(categoryName => {
    const categoryPath = path.join(portfolioRoot, categoryName)
    const categoryId = slugify(categoryName)

    const subcategories = fs.readdirSync(categoryPath)
      .filter(f => fs.statSync(path.join(categoryPath, f)).isDirectory())
      .sort()
      .map(subName => {
        const subPath = path.join(categoryPath, subName)
        const subId = slugify(subName)

        const images = fs.readdirSync(subPath)
          .filter(isImage)
          .sort()
          .map((imgFile, idx) => {
            const rawSrc = `/assets/portfolio/${categoryName}/${subName}/${imgFile}`
            const encodedSrc = `/assets/portfolio/${encodeURIComponent(categoryName)}/${encodeURIComponent(subName)}/${encodeURIComponent(imgFile)}`
            return {
              id: `${categoryId}-${subId}-${String(idx + 1).padStart(2, '0')}`,
              src: encodedSrc,
              alt: `${subName} — ${categoryName} product photography`,
              width: 800,
              height: 800,
            }
          })

        return { id: subId, name: subName, images }
      })

    return { id: categoryId, name: categoryName, subcategories }
  })

const totalImages = categories.reduce(
  (acc, cat) => acc + cat.subcategories.reduce((a, s) => a + s.images.length, 0), 0
)

const output = `// data/portfolioData.ts
// AUTO-GENERATED — run: node scripts/generate-portfolio-data.mjs

export interface PortfolioImage {
  id: string
  src: string
  alt: string
  width: number
  height: number
}

export interface Subcategory {
  id: string
  name: string
  images: PortfolioImage[]
}

export interface Category {
  id: string
  name: string
  subcategories: Subcategory[]
}

export function getAllImagesFromCategory(category: Category): PortfolioImage[] {
  return category.subcategories.flatMap(sub => sub.images)
}

export function getImagesFromSubcategory(categoryId: string, subcategoryId: string): PortfolioImage[] {
  const cat = portfolioData.find(c => c.id === categoryId)
  if (!cat) return []
  const sub = cat.subcategories.find(s => s.id === subcategoryId)
  return sub?.images ?? []
}

export const portfolioData: Category[] = ${JSON.stringify(categories, null, 2)}
`

fs.writeFileSync(outputPath, output, 'utf-8')
console.log(`✅ portfolioData.ts generated — ${categories.length} categories, ${totalImages} images`)
categories.forEach(c => {
  const total = c.subcategories.reduce((n, s) => n + s.images.length, 0)
  console.log(`   ${c.name}: ${c.subcategories.length} subcategories, ${total} images`)
})
