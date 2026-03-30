import { AlertTriangle, Clock, TrendingDown, Package } from 'lucide-react'
import type { ProblemItem } from '@/types'

export const problems: ProblemItem[] = [
  {
    icon: AlertTriangle,
    title: 'Technical Complexity',
    description:
      'Every platform has different rules for images, titles, metadata, and SEO.',
  },
  {
    icon: Clock,
    title: 'Time-Consuming Workflows',
    description:
      "Photography, descriptions, uploads — it all adds up to hours you don't have.",
  },
  {
    icon: TrendingDown,
    title: 'Poor Listing Performance',
    description:
      'Unoptimized listings miss search traffic and fail to convert browsers into buyers.',
  },
  {
    icon: Package,
    title: 'Scaling Challenges',
    description:
      'More products means more chaos — without a system, growth becomes painful.',
  },
]
