/**
 * Bilingual defaults for the editable landing-page sections (hero, services,
 * pricing, FAQ, contact). This is the single source of truth for both English
 * and Arabic copy and mirrors the shape stored per-language in the
 * `landing_content` Supabase table. When a DB row is empty the app falls back
 * to the values here (see lib/db/landing.ts).
 *
 * Only the five editor-managed sections live here. UI chrome (buttons, form
 * labels, nav) and the non-editable sections (problem, solution, workflow,
 * portfolio, footer) are translated via next-intl message catalogs.
 */

import type { Locale } from '@/i18n/config'

export interface HeroStat {
  value: number
  suffix: string
  label: string
}
export interface HeroContent {
  heading: string
  /** Words within `heading` to render in the accent color. */
  accent: string[]
  subheading: string
  ctaPrimary: string
  ctaSecondary: string
  stats: HeroStat[]
}

export interface ServiceItemContent {
  title: string
  description: string
  features: string[]
}
export interface ServicesContent {
  eyebrow: string
  heading: string
  accent: string[]
  fullServiceBadge: string
  items: ServiceItemContent[]
}

export interface PricingPlan {
  kicker: string
  /** Numeric price for the animated counter; omit when `priceText` is set. */
  priceValue?: number
  priceSuffix?: string
  /** Free-form price label (e.g. "Custom Pricing") — overrides the counter. */
  priceText?: string
  unit: string
  extraNote?: string
  name: string
  features: string[]
  note?: string
  badge?: string
  /** Highlight this plan as the primary/featured card (dark styling). */
  featured?: boolean
  cta: string
  bulk?: { title: string; rows: { label: string; value: string }[] }
}

export interface PricingTab {
  /** Stable key used by the tab trigger + `defaultTab`. */
  id: string
  label: string
  /** One line under the tab bar. */
  tagline?: string
  /** Pill on the trigger itself, e.g. "Best value". */
  badge?: string
  /** Line under the grid — used to nudge one-time tabs toward the monthly plans. */
  footnote?: string
  plans: PricingPlan[]
}

export interface PricingContent {
  eyebrow: string
  heading: string
  accent: string[]
  subheading: string
  /** Which tab opens first. */
  defaultTab: string
  tabs: PricingTab[]
}

/**
 * Tabs for a pricing blob. Tolerates a `landing_content` row still saved in the
 * old flat `{ plans: [...] }` shape so a stale DB override never blanks the section.
 */
export function pricingTabs(content: PricingContent): PricingTab[] {
  if (content?.tabs?.length) return content.tabs
  const legacy = (content as unknown as { plans?: PricingPlan[] })?.plans
  return legacy?.length ? [{ id: 'plans', label: 'Plans', plans: legacy }] : []
}

export interface FaqItem {
  question: string
  answer: string
}
export interface FaqContent {
  eyebrow: string
  heading: string
  accent: string[]
  intro: string
  cta: string
  items: FaqItem[]
}

export interface ContactContent {
  eyebrow: string
  heading: string
  accent: string[]
  intro: string
  phones: string[]
  email: string
  location: string
}

export interface LandingContent {
  hero: HeroContent
  services: ServicesContent
  pricing: PricingContent
  faq: FaqContent
  contact: ContactContent
}

/** Section keys that are stored/edited individually. */
export const LANDING_SECTIONS = ['hero', 'services', 'pricing', 'faq', 'contact'] as const
export type LandingSection = (typeof LANDING_SECTIONS)[number]

const en: LandingContent = {
  hero: {
    heading: 'From product to marketplace — in one flow.',
    accent: ['one', 'flow.'],
    subheading:
      "Egypt's elite e-commerce content studio. We turn raw products into high-converting listings — photography, bilingual copy, SEO, and full account management for Amazon, Noon, TikTok Shop & Shopify sellers.",
    ctaPrimary: 'Start Your Flow',
    ctaSecondary: 'See how it works',
    stats: [
      { value: 210, suffix: '+', label: 'Products shot' },
      { value: 4, suffix: '', label: 'Marketplaces' },
      { value: 15, suffix: ' EGP', label: 'Starting price' },
    ],
  },
  services: {
    eyebrow: 'What We Do',
    heading: 'Four core services. One seamless flow.',
    accent: ['seamless'],
    fullServiceBadge: 'Full Service',
    items: [
      {
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
    ],
  },
  pricing: {
    eyebrow: 'Pricing',
    heading: 'Pick a plan, not a price list.',
    accent: ['plan,'],
    subheading:
      'All prices in Egyptian Pounds (EGP). Monthly growth plans bundle everything we do — content, photography and full account management — for less than buying each piece on its own.',
    defaultTab: 'growth',
    tabs: [
      {
        id: 'content',
        label: 'Content',
        tagline: 'Per-item content work. Send us products, get listing-ready assets back.',
        footnote: 'One-time, per item — no ongoing account support included.',
        plans: [
          {
            kicker: 'Copy only',
            priceValue: 10,
            priceSuffix: ' EGP',
            unit: '/ per item',
            name: 'Listing',
            features: [
              'Compelling, value-focused professional title',
              'Bilingual description (Arabic + English)',
              'Targeted keywords & SEO best practices',
              'Marketing-oriented conversion copy',
              'Platform-compliant formatting',
            ],
            cta: 'Get Started',
          },
          {
            kicker: 'Studio only',
            priceValue: 30,
            priceSuffix: ' EGP',
            unit: '/ per item',
            name: 'Photography',
            features: [
              'Professional studio photography',
              'White background shots',
              'Full editing & optimization',
              '3–5 high-resolution photos',
            ],
            note: 'On-location shoots incur additional transportation fees.',
            cta: 'Get Started',
          },
          {
            kicker: 'Photography + listing',
            priceValue: 35,
            priceSuffix: ' EGP',
            unit: '/ per item',
            extraNote: 'Save 5 EGP per item',
            name: 'Full Content',
            badge: 'Best of this tab',
            featured: true,
            features: [
              'Everything in Listing',
              'Everything in Photography',
              'Shot and written as one brief',
              'One delivery, listing-ready',
            ],
            cta: 'Get Started',
          },
        ],
      },
      {
        id: 'account',
        label: 'Account Management',
        tagline: 'We run your seller account. Fixed monthly fee plus a share of sales.',
        footnote: 'Content is billed separately per item — or bundled free in a growth plan.',
        plans: [
          {
            kicker: 'Keep the store running',
            priceValue: 2500,
            priceSuffix: ' EGP',
            unit: '/ per month',
            extraNote: '+ 1% of sales',
            name: 'Basic',
            features: [
              'Account creation & setup',
              'Uploading items',
              'Manage returns',
              'Generate reports',
            ],
            cta: 'Get Started',
          },
          {
            kicker: 'Run it and grow it',
            priceValue: 5000,
            priceSuffix: ' EGP',
            unit: '/ per month',
            extraNote: '+ 2% of sales',
            name: 'Premium',
            badge: 'Best of this tab',
            featured: true,
            features: [
              'Everything in Basic',
              'FBA inventory management',
              "Create PO's",
              'Brand Registry',
              'Price analysis',
            ],
            cta: 'Get Started',
          },
        ],
      },
      {
        id: 'growth',
        label: 'Full Growth',
        badge: 'Best value',
        tagline:
          'Everything we do — listing, photography and full account management — in one monthly plan. Your sales share starts low and only grows as we hit your KPIs, capped at 5% forever.',
        plans: [
          {
            kicker: 'Testing the waters',
            priceValue: 3500,
            priceSuffix: ' EGP',
            unit: '/ per month',
            extraNote: '+ 1% of sales',
            name: 'Starter',
            features: [
              'Listing optimization included',
              'Studio photography included',
              'Full account management included',
              'Your own client dashboard',
              'Monthly performance report',
            ],
            bulk: {
              title: "What's included",
              rows: [
                { label: 'Products', value: 'up to 50' },
                { label: 'Sales share', value: '1% → max 5%' },
                { label: 'Photography', value: 'Included' },
                { label: 'Listings', value: 'Included' },
                { label: 'Account management', value: 'Basic' },
              ],
            },
            cta: 'Start Your Flow',
          },
          {
            kicker: 'Our most-picked plan',
            priceValue: 8000,
            priceSuffix: ' EGP',
            unit: '/ per month',
            extraNote: '+ 1.5% of sales',
            name: 'Growth',
            badge: 'Most Popular',
            featured: true,
            features: [
              'Listing optimization included',
              'Studio photography included',
              'Full account management included',
              'Your own client dashboard',
              'Dedicated account manager',
              'Bi-weekly performance review',
            ],
            bulk: {
              title: "What's included",
              rows: [
                { label: 'Products', value: 'up to 150' },
                { label: 'Sales share', value: '1.5% → max 5%' },
                { label: 'Photography', value: 'Included' },
                { label: 'Listings', value: 'Included' },
                { label: 'Account management', value: 'Premium' },
              ],
            },
            note: '53 EGP per product — 24% less than buying content on its own.',
            cta: 'Start Your Flow',
          },
          {
            kicker: 'Serious catalogue',
            priceValue: 18000,
            priceSuffix: ' EGP',
            unit: '/ per month',
            extraNote: '+ 2% of sales',
            name: 'Scale',
            features: [
              'Listing optimization included',
              'Studio photography included',
              'Full account management included',
              'Your own client dashboard',
              'Dedicated account manager',
              'Weekly performance review',
              'Priority production queue',
            ],
            bulk: {
              title: "What's included",
              rows: [
                { label: 'Products', value: 'up to 400' },
                { label: 'Sales share', value: '2% → max 5%' },
                { label: 'Photography', value: 'Included' },
                { label: 'Listings', value: 'Included' },
                { label: 'Account management', value: 'Premium' },
              ],
            },
            note: '45 EGP per product — the lowest per-item rate we offer.',
            cta: 'Start Your Flow',
          },
        ],
      },
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    heading: 'Questions, answered.',
    accent: ['answered.'],
    intro:
      "Everything you need to know before you send us your first product. Still unsure? We're one message away.",
    cta: 'Talk to us →',
    items: [
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
    ],
  },
  contact: {
    eyebrow: 'Get in Touch',
    heading: 'Ready to start your flow?',
    accent: ['flow?'],
    intro:
      "Tell us about your products and we'll put together a plan that fits your needs and budget. Fast response guaranteed.",
    phones: ['01550408340', '01121443286', '01125450608'],
    email: 'flowagency.eg@gmail.com',
    location: 'Cairo, Egypt',
  },
}

const ar: LandingContent = {
  hero: {
    heading: 'من المنتج إلى المتجر — في تدفّق واحد.',
    accent: [],
    subheading:
      'استوديو المحتوى الأول للتجارة الإلكترونية في مصر. نحوّل منتجاتك الخام إلى قوائم عالية التحويل — تصوير احترافي، محتوى بلغتين، تحسين لمحركات البحث، وإدارة كاملة للحسابات على أمازون ونون وتيك توك شوب وشوبيفاي.',
    ctaPrimary: 'ابدأ تدفّقك',
    ctaSecondary: 'كيف نعمل',
    stats: [
      { value: 210, suffix: '+', label: 'منتج تم تصويره' },
      { value: 4, suffix: '', label: 'منصات بيع' },
      { value: 15, suffix: ' ج.م', label: 'يبدأ السعر من' },
    ],
  },
  services: {
    eyebrow: 'ماذا نقدّم',
    heading: 'أربع خدمات أساسية. تدفّق واحد متكامل.',
    accent: [],
    fullServiceBadge: 'خدمة متكاملة',
    items: [
      {
        title: 'إنشاء محتوى المنتجات',
        description:
          'ننشئ محتوى منتجات احترافيًا مصممًا للنجاح في المتاجر الإلكترونية — من تصوير الاستوديو إلى العناوين المحسّنة لمحركات البحث والأوصاف بلغتين.',
        features: [
          'تصوير استوديو على خلفية بيضاء',
          'تنقيح وتحرير احترافي',
          '3–5 صور عالية الدقة',
          'أوصاف بلغتين (عربي + إنجليزي)',
          'عناوين وكلمات مفتاحية محسّنة لمحركات البحث',
        ],
      },
      {
        title: 'تحسين القوائم',
        description:
          'نضمن ظهور قوائمك في مرتبة أعلى وتحويلًا أفضل عبر جميع منصات التجارة الإلكترونية الكبرى.',
        features: [
          'استراتيجية SEO وكلمات مفتاحية للمتاجر',
          'تنسيق متوافق مع كل منصة',
          'تحسين هيكل التصنيفات',
          'نصوص تركّز على التحويل',
          'مراجعة توافق القوائم',
        ],
      },
      {
        title: 'إدارة المتاجر',
        description:
          'ندير حسابات البائع وكتالوج المنتجات نيابةً عنك لتتفرّغ للتوريد والتوسّع.',
        features: [
          'رفع القوائم وإدارة الكتالوج',
          'تحديث المنتجات وصيانتها',
          'دعم متعدد المنصات',
          'الالتزام بمتطلبات المتاجر',
          'دعم مخصّص للحساب',
        ],
      },
      {
        title: 'إدارة الحسابات',
        description:
          'نتولّى الإدارة الكاملة لحسابات البائع الخاصة بك — إدارة القوائم، وتتبّع الأداء، وضمان سير كل شيء بسلاسة عبر جميع المنصات.',
        features: [
          'إدارة كاملة لحساب البائع',
          'رفع القوائم وإدارة الكتالوج',
          'تحديث المنتجات وصيانتها',
          'مراقبة الالتزام بمتطلبات المتاجر',
          'تتبّع الأداء وإعداد التقارير',
          'منصات متعددة: أمازون، نون، تيك توك شوب، شوبيفاي',
          'مدير حساب مخصّص',
        ],
      },
    ],
  },
  pricing: {
    eyebrow: 'الأسعار',
    heading: 'اختر خطة، لا قائمة أسعار.',
    accent: [],
    subheading:
      'جميع الأسعار بالجنيه المصري (ج.م). الخطط الشهرية تجمع كل ما نقدّمه — المحتوى والتصوير وإدارة الحساب الكاملة — بأقل من شراء كل خدمة على حدة.',
    defaultTab: 'growth',
    tabs: [
      {
        id: 'content',
        label: 'المحتوى',
        tagline: 'محتوى بالقطعة. أرسل لنا منتجاتك واستلم أصولًا جاهزة للنشر.',
        footnote: 'دفعة واحدة لكل منتج — لا تشمل إدارة مستمرة للحساب.',
        plans: [
          {
            kicker: 'النصوص فقط',
            priceValue: 10,
            priceSuffix: ' ج.م',
            unit: '/ لكل منتج',
            name: 'القوائم',
            features: [
              'عنوان احترافي جذّاب يركّز على القيمة',
              'وصف بلغتين (عربي + إنجليزي)',
              'كلمات مفتاحية مستهدفة وأفضل ممارسات SEO',
              'نصوص تسويقية تركّز على التحويل',
              'تنسيق متوافق مع كل منصة',
            ],
            cta: 'ابدأ الآن',
          },
          {
            kicker: 'الاستوديو فقط',
            priceValue: 30,
            priceSuffix: ' ج.م',
            unit: '/ لكل منتج',
            name: 'التصوير',
            features: [
              'تصوير استوديو احترافي',
              'لقطات على خلفية بيضاء',
              'تحرير وتحسين كامل',
              '3–5 صور عالية الدقة',
            ],
            note: 'تُضاف رسوم انتقال إضافية لجلسات التصوير خارج الاستوديو.',
            cta: 'ابدأ الآن',
          },
          {
            kicker: 'التصوير + القوائم',
            priceValue: 35,
            priceSuffix: ' ج.م',
            unit: '/ لكل منتج',
            extraNote: 'وفّر 5 ج.م لكل منتج',
            name: 'المحتوى الكامل',
            badge: 'الأفضل في هذا القسم',
            featured: true,
            features: [
              'كل ما في باقة القوائم',
              'كل ما في باقة التصوير',
              'تصوير وكتابة ببريف واحد',
              'تسليم واحد جاهز للنشر',
            ],
            cta: 'ابدأ الآن',
          },
        ],
      },
      {
        id: 'account',
        label: 'إدارة الحسابات',
        tagline: 'نحن ندير حساب البائع الخاص بك. رسوم شهرية ثابتة + نسبة من المبيعات.',
        footnote: 'يُحسب المحتوى بالقطعة بشكل منفصل — أو مجانًا داخل خطة النمو.',
        plans: [
          {
            kicker: 'تشغيل المتجر',
            priceValue: 2500,
            priceSuffix: ' ج.م',
            unit: '/ شهريًا',
            extraNote: '+ 1% من المبيعات',
            name: 'الأساسية',
            features: [
              'إنشاء الحساب وإعداده',
              'رفع المنتجات',
              'إدارة المرتجعات',
              'إعداد التقارير',
            ],
            cta: 'ابدأ الآن',
          },
          {
            kicker: 'تشغيل ونمو',
            priceValue: 5000,
            priceSuffix: ' ج.م',
            unit: '/ شهريًا',
            extraNote: '+ 2% من المبيعات',
            name: 'المتقدّمة',
            badge: 'الأفضل في هذا القسم',
            featured: true,
            features: [
              'كل ما في الخطة الأساسية',
              'إدارة مخزون FBA',
              'إنشاء أوامر الشراء',
              'تسجيل العلامة التجارية (Brand Registry)',
              'تحليل الأسعار',
            ],
            cta: 'ابدأ الآن',
          },
        ],
      },
      {
        id: 'growth',
        label: 'النمو الكامل',
        badge: 'الأفضل قيمة',
        tagline:
          'كل ما نقدّمه — القوائم والتصوير وإدارة الحساب الكاملة — في خطة شهرية واحدة. تبدأ نسبة المبيعات منخفضة وترتفع فقط عند تحقيق مؤشرات الأداء، وبحد أقصى 5% دائمًا.',
        plans: [
          {
            kicker: 'بداية محسوبة',
            priceValue: 3500,
            priceSuffix: ' ج.م',
            unit: '/ شهريًا',
            extraNote: '+ 1% من المبيعات',
            name: 'ستارتر',
            features: [
              'تحسين القوائم مشمول',
              'تصوير استوديو مشمول',
              'إدارة كاملة للحساب مشمولة',
              'لوحة تحكم خاصة بك',
              'تقرير أداء شهري',
            ],
            bulk: {
              title: 'ما تشمله الخطة',
              rows: [
                { label: 'عدد المنتجات', value: 'حتى 50' },
                { label: 'نسبة المبيعات', value: '1% ← بحد أقصى 5%' },
                { label: 'التصوير', value: 'مشمول' },
                { label: 'القوائم', value: 'مشمولة' },
                { label: 'إدارة الحساب', value: 'الأساسية' },
              ],
            },
            cta: 'ابدأ تدفّقك',
          },
          {
            kicker: 'الخطة الأكثر اختيارًا',
            priceValue: 8000,
            priceSuffix: ' ج.م',
            unit: '/ شهريًا',
            extraNote: '+ 1.5% من المبيعات',
            name: 'جروث',
            badge: 'الأكثر طلبًا',
            featured: true,
            features: [
              'تحسين القوائم مشمول',
              'تصوير استوديو مشمول',
              'إدارة كاملة للحساب مشمولة',
              'لوحة تحكم خاصة بك',
              'مدير حساب مخصّص',
              'مراجعة أداء كل أسبوعين',
            ],
            bulk: {
              title: 'ما تشمله الخطة',
              rows: [
                { label: 'عدد المنتجات', value: 'حتى 150' },
                { label: 'نسبة المبيعات', value: '1.5% ← بحد أقصى 5%' },
                { label: 'التصوير', value: 'مشمول' },
                { label: 'القوائم', value: 'مشمولة' },
                { label: 'إدارة الحساب', value: 'المتقدّمة' },
              ],
            },
            note: '53 ج.م لكل منتج — أقل بنسبة 24% من شراء المحتوى بالقطعة.',
            cta: 'ابدأ تدفّقك',
          },
          {
            kicker: 'كتالوج كبير',
            priceValue: 18000,
            priceSuffix: ' ج.م',
            unit: '/ شهريًا',
            extraNote: '+ 2% من المبيعات',
            name: 'سكيل',
            features: [
              'تحسين القوائم مشمول',
              'تصوير استوديو مشمول',
              'إدارة كاملة للحساب مشمولة',
              'لوحة تحكم خاصة بك',
              'مدير حساب مخصّص',
              'مراجعة أداء أسبوعية',
              'أولوية في طابور الإنتاج',
            ],
            bulk: {
              title: 'ما تشمله الخطة',
              rows: [
                { label: 'عدد المنتجات', value: 'حتى 400' },
                { label: 'نسبة المبيعات', value: '2% ← بحد أقصى 5%' },
                { label: 'التصوير', value: 'مشمول' },
                { label: 'القوائم', value: 'مشمولة' },
                { label: 'إدارة الحساب', value: 'المتقدّمة' },
              ],
            },
            note: '45 ج.م لكل منتج — أقل سعر للمنتج نقدّمه.',
            cta: 'ابدأ تدفّقك',
          },
        ],
      },
    ],
  },
  faq: {
    eyebrow: 'الأسئلة الشائعة',
    heading: 'إجابات على أسئلتك.',
    accent: [],
    intro:
      'كل ما تحتاج معرفته قبل إرسال أول منتج لك. ما زلت غير متأكد؟ نحن على بُعد رسالة واحدة.',
    cta: 'تحدّث إلينا →',
    items: [
      {
        question: 'ما المتاجر التي تعملون معها؟',
        answer:
          'ننتج المحتوى وندير حسابات البائع على أمازون ونون وتيك توك شوب وشوبيفاي. إن كنت تبيع على منصة أخرى، أخبرنا — فأسلوب عملنا يتكيّف مع معظم متطلبات المتاجر والمواقع.',
      },
      {
        question: 'كيف يعمل التسعير لكل منتج؟',
        answer:
          'يُحسب سعر المحتوى لكل منتج فتدفع فقط مقابل ما ترسله لنا. يبدأ تحسين القائمة من 15 ج.م، وتصوير الاستوديو من 30 ج.م، والباقة المتكاملة (صور + قائمة) بـ 40 ج.م — مع خصومات للكميات تصل إلى 20 ج.م لكل منتج في الدفعات الكبيرة.',
      },
      {
        question: 'كم يستغرق تنفيذ الدفعة عادةً؟',
        answer:
          'يعتمد وقت التنفيذ على الكمية، لكن معظم الدفعات تنتقل من تسليم المنتج إلى نشر القوائم خلال أيام عمل قليلة. أما إدارة الحسابات المستمرة فنعمل عليها وفق جدول متواصل ومراقَب حتى لا يتوقف أي شيء.',
      },
      {
        question: 'هل تكتبون بالعربية والإنجليزية معًا؟',
        answer:
          'نعم. تتضمّن كل باقة قوائم محتوى بلغتين محسّنًا لمحركات البحث — عناوين ونقاط وأوصاف مكتوبة للتحويل بالعربية والإنجليزية وبما يتوافق مع قواعد تنسيق كل منصة.',
      },
      {
        question: 'هل يمكنكم إدارة حساب البائع بالكامل؟',
        answer:
          'بالتأكيد. تتولّى خدمة إدارة الحسابات الإدارة الكاملة لحساباتك — الرفع، وصيانة الكتالوج، ومراقبة الالتزام، وتقارير الأداء — مقابل رسم شهري بالإضافة إلى نسبة صغيرة من المبيعات، مع مدير حساب مخصّص.',
      },
      {
        question: 'ماذا تحتاجون مني للبدء؟',
        answer:
          'فقط منتجاتك (أو قائمة جرد واضحة وأي أصول موجودة) والمنصات التي تبيع عليها. نتولّى التصوير والنصوص والتحسين والنشر من هناك. راسلنا وسنضع خطة تناسب كتالوجك وميزانيتك.',
      },
    ],
  },
  contact: {
    eyebrow: 'تواصل معنا',
    heading: 'جاهز لتبدأ تدفّقك؟',
    accent: [],
    intro:
      'أخبرنا عن منتجاتك وسنضع خطة تناسب احتياجاتك وميزانيتك. رد سريع مضمون.',
    phones: ['01550408340', '01121443286', '01125450608'],
    email: 'flowagency.eg@gmail.com',
    location: 'القاهرة، مصر',
  },
}

export const defaultLandingContent: Record<Locale, LandingContent> = { en, ar }
