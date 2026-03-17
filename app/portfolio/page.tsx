import type { Metadata } from 'next'
import PortfolioClient from '@/components/portfolio/PortfolioClient'
import { portfolioData } from '@/data/portfolioData'

export const metadata: Metadata = {
  title: 'Portfolio — FLOW Commerce Studio',
  description:
    'Browse our product photography, listing optimization, and marketplace content work.',
}

export default function PortfolioPage() {
  return <PortfolioClient data={portfolioData} />
}
