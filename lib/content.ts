import type { AccordionItem } from '@/components/ui/Accordion'

/* ── Team ──────────────────────────────────────────────
 * Avatars are rendered as initials on a brand gradient — drop real
 * headshots into /public/assets/team and add a `photo` field to swap in.
 */
export interface TeamMember {
  name: string
  role: string
  initials: string
  photo?: string
}

export const team: TeamMember[] = [
  { name: 'Youssef Adel', role: 'Founder & Creative Director', initials: 'YA' },
  { name: 'Mariam Hassan', role: 'Head of Production', initials: 'MH' },
  { name: 'Omar Khaled', role: 'Lead Product Photographer', initials: 'OK' },
  { name: 'Nour El-Sayed', role: 'Listing & SEO Strategist', initials: 'NS' },
  { name: 'Karim Fathy', role: 'Marketplace Account Manager', initials: 'KF' },
  { name: 'Layla Mostafa', role: 'Bilingual Copy Lead', initials: 'LM' },
]

/* ── FAQ ─────────────────────────────────────────────── */
export const faqs: AccordionItem[] = [
  {
    question: 'Which marketplaces do you work with?',
    answer:
      'We produce content and manage seller accounts for Amazon, Noon, TikTok Shop, and Shopify. If you sell on another platform, tell us — our workflow adapts to most marketplace and storefront requirements.',
  },
  {
    question: 'How does per-product pricing work?',
    answer:
      'Content is priced per product so you only pay for what you send us. Listing optimization starts at 15 EGP, studio photography at 30 EGP, and the complete photo + listing package at 40 EGP — with bulk discounts as low as 20 EGP per product on large batches.',
  },
  {
    question: 'How long does a typical batch take?',
    answer:
      'Turnaround depends on volume, but most batches move from product hand-off to published listings within a few working days. For ongoing account management we operate on a continuous, monitored schedule so nothing stalls.',
  },
  {
    question: 'Do you write in both Arabic and English?',
    answer:
      'Yes. Every listing package includes bilingual, SEO-optimized copy — titles, bullet points, and descriptions written to convert in both Arabic and English and to comply with each platform’s formatting rules.',
  },
  {
    question: 'Can you fully manage my seller account?',
    answer:
      'Absolutely. Our Account Management service takes full ownership of your marketplace accounts — uploads, catalog maintenance, compliance monitoring, and performance reporting — for a monthly fee plus a small share of sales, with a dedicated account manager.',
  },
  {
    question: 'What do you need from me to start?',
    answer:
      'Just your products (or a clear inventory list and any existing assets) and the platforms you sell on. We handle photography, copy, optimization, and publishing from there. Send us a message and we’ll scope a plan that fits your catalog and budget.',
  },
]
