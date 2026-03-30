import { Camera, BarChart2, Store, LayoutDashboard } from 'lucide-react'
import type { ServiceItem } from '@/types'

export const services: ServiceItem[] = [
  {
    icon: Camera,
    title: 'Product Content Creation',
    description:
      'We create professional product content built for marketplace success — from studio photography to SEO-optimized titles and bilingual descriptions.',
    features: [
      'Studio photography on white background',
      'Professional retouching & editing',
      '3–5 high-resolution photos',
      'Bilingual descriptions (Arabic + English)',
      'SEO-optimized titles & keywords',
    ],
  },
  {
    icon: BarChart2,
    title: 'Listing Optimization',
    description:
      'We ensure your listings rank higher and convert better across all major e-commerce platforms.',
    features: [
      'Marketplace SEO & keyword strategy',
      'Platform-compliant formatting',
      'Category structure optimization',
      'Conversion-focused copy',
      'Listing compliance review',
    ],
  },
  {
    icon: Store,
    title: 'Marketplace Management',
    description:
      'We manage your seller accounts and product catalog so you can focus on sourcing and scaling.',
    features: [
      'Listing uploads & catalog management',
      'Product updates & maintenance',
      'Multi-platform support',
      'Marketplace compliance',
      'Dedicated account support',
    ],
  },
  {
    icon: LayoutDashboard,
    title: 'Account Management',
    description:
      'We take full ownership of your marketplace seller accounts — managing listings, tracking performance, and keeping everything running smoothly across every platform.',
    features: [
      'Complete seller account management',
      'Listing uploads & catalog management',
      'Product updates & maintenance',
      'Marketplace compliance monitoring',
      'Performance tracking & reporting',
      'Multi-platform: Amazon, Noon, TikTok Shop, Shopify',
      'Dedicated account manager',
    ],
  },
]
