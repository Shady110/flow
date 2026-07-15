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
  badge: string
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
  cta: string
  bulk?: { title: string; rows: { label: string; value: string }[] }
}
export interface PricingContent {
  eyebrow: string
  heading: string
  accent: string[]
  subheading: string
  bulkTitle: string
  plans: PricingPlan[]
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
    badge: '2 onboarding spots open this month',
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
    heading: 'Simple, transparent pricing.',
    accent: ['transparent'],
    subheading:
      'All prices in Egyptian Pounds (EGP). Volume discounts available for large batches.',
    bulkTitle: 'Bulk Discounts',
    plans: [
      {
        kicker: 'Premium Content Only',
        priceValue: 15,
        priceSuffix: ' EGP',
        unit: '/ per product',
        name: 'Listing Optimization Only',
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
        kicker: 'Studio Photography Package',
        priceValue: 30,
        priceSuffix: ' EGP',
        unit: '/ per product',
        name: 'Photography Only',
        features: [
          'Professional studio photography',
          'White background shots',
          'Full editing & optimization',
          '3–5 high-resolution photos',
          'Large items (furniture, appliances): 150 EGP → up to 10 photos',
        ],
        note: 'On-location shoots incur additional transportation fees.',
        cta: 'Get Started',
      },
      {
        kicker: 'Photography + Professional Listing',
        priceValue: 40,
        priceSuffix: ' EGP',
        unit: '/ per product',
        name: 'Complete Package',
        badge: 'Most Popular',
        features: [
          'Studio photography on white background',
          'Professional retouching & editing',
          '3–5 high-resolution photos',
          'Bilingual description (Arabic + English)',
          'SEO-optimized title & strategic keywords',
        ],
        bulk: {
          title: 'Bulk Discounts',
          rows: [
            { label: '500+ items', value: '30 EGP / product' },
            { label: '1,000+ items', value: '20 EGP / product' },
          ],
        },
        cta: 'Start Your Flow',
      },
      {
        kicker: 'Professional Video Production',
        priceValue: 500,
        priceSuffix: ' EGP',
        unit: '/ per video',
        name: 'Product Video',
        features: [
          'Professional filming (unboxing, UGC, sponsored ad)',
          'Creative editing & music',
          'Text overlays & final polish',
          'Ready for social media, listings & ads',
        ],
        cta: 'Get Started',
      },
      {
        kicker: 'Website Creation Service',
        priceText: 'Custom Pricing',
        unit: 'Tailored to your project scope',
        name: 'E-commerce Website',
        features: [
          'Custom e-commerce website design',
          'Product catalog integration',
          'Marketplace-ready storefront',
        ],
        cta: 'Request a Quote',
      },
      {
        kicker: 'Photography + Social Media Package',
        priceText: 'Custom Pricing',
        unit: '/ per session',
        name: 'Social Media Content',
        badge: 'Custom',
        features: [
          'Full creative session: still + lifestyle shots',
          'High-quality professional photography',
          'Ready-to-post social media designs',
          'Instagram, Facebook & TikTok formats',
          'Pricing based on scope & complexity',
        ],
        cta: 'Request a Quote',
      },
      {
        kicker: 'Full Marketplace Account Management',
        priceValue: 10000,
        priceSuffix: ' EGP',
        unit: '/ per month',
        extraNote: '+ 5% of sales',
        name: 'Account Management',
        features: [
          'Complete seller account management',
          'Listing uploads & catalog management',
          'Product updates & maintenance',
          'Marketplace compliance monitoring',
          'Performance tracking & reporting',
          'Multi-platform support (Amazon, Noon, TikTok Shop, Shopify)',
          'Dedicated account manager',
        ],
        cta: 'Get Started',
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
    badge: 'مكانان متاحان للانضمام هذا الشهر',
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
    heading: 'أسعار بسيطة وشفّافة.',
    accent: [],
    subheading:
      'جميع الأسعار بالجنيه المصري (ج.م). تتوفّر خصومات للكميات الكبيرة.',
    bulkTitle: 'خصومات الكميات',
    plans: [
      {
        kicker: 'المحتوى المتميّز فقط',
        priceValue: 15,
        priceSuffix: ' ج.م',
        unit: '/ لكل منتج',
        name: 'تحسين القائمة فقط',
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
        kicker: 'باقة تصوير الاستوديو',
        priceValue: 30,
        priceSuffix: ' ج.م',
        unit: '/ لكل منتج',
        name: 'التصوير فقط',
        features: [
          'تصوير استوديو احترافي',
          'لقطات على خلفية بيضاء',
          'تحرير وتحسين كامل',
          '3–5 صور عالية الدقة',
          'المنتجات الكبيرة (أثاث، أجهزة): 150 ج.م → حتى 10 صور',
        ],
        note: 'تُضاف رسوم انتقال إضافية لجلسات التصوير خارج الاستوديو.',
        cta: 'ابدأ الآن',
      },
      {
        kicker: 'التصوير + قائمة احترافية',
        priceValue: 40,
        priceSuffix: ' ج.م',
        unit: '/ لكل منتج',
        name: 'الباقة المتكاملة',
        badge: 'الأكثر طلبًا',
        features: [
          'تصوير استوديو على خلفية بيضاء',
          'تنقيح وتحرير احترافي',
          '3–5 صور عالية الدقة',
          'وصف بلغتين (عربي + إنجليزي)',
          'عنوان محسّن لمحركات البحث وكلمات مفتاحية استراتيجية',
        ],
        bulk: {
          title: 'خصومات الكميات',
          rows: [
            { label: '500+ منتج', value: '30 ج.م / منتج' },
            { label: '1,000+ منتج', value: '20 ج.م / منتج' },
          ],
        },
        cta: 'ابدأ تدفّقك',
      },
      {
        kicker: 'إنتاج فيديو احترافي',
        priceValue: 500,
        priceSuffix: ' ج.م',
        unit: '/ لكل فيديو',
        name: 'فيديو المنتج',
        features: [
          'تصوير احترافي (فتح العلبة، UGC، إعلان ممول)',
          'مونتاج إبداعي وموسيقى',
          'نصوص على الشاشة ولمسات نهائية',
          'جاهز لوسائل التواصل والقوائم والإعلانات',
        ],
        cta: 'ابدأ الآن',
      },
      {
        kicker: 'خدمة إنشاء المواقع',
        priceText: 'سعر مخصّص',
        unit: 'يُحدّد حسب نطاق مشروعك',
        name: 'متجر إلكتروني',
        features: [
          'تصميم متجر إلكتروني مخصّص',
          'دمج كتالوج المنتجات',
          'واجهة متجر جاهزة للمتاجر الإلكترونية',
        ],
        cta: 'اطلب عرض سعر',
      },
      {
        kicker: 'باقة التصوير + السوشيال ميديا',
        priceText: 'سعر مخصّص',
        unit: '/ لكل جلسة',
        name: 'محتوى السوشيال ميديا',
        badge: 'مخصّص',
        features: [
          'جلسة إبداعية كاملة: لقطات ثابتة + لايف ستايل',
          'تصوير احترافي عالي الجودة',
          'تصاميم جاهزة للنشر على السوشيال ميديا',
          'صيغ إنستجرام وفيسبوك وتيك توك',
          'السعر حسب النطاق والتعقيد',
        ],
        cta: 'اطلب عرض سعر',
      },
      {
        kicker: 'الإدارة الكاملة لحساب المتجر',
        priceValue: 10000,
        priceSuffix: ' ج.م',
        unit: '/ شهريًا',
        extraNote: '+ 5% من المبيعات',
        name: 'إدارة الحسابات',
        features: [
          'إدارة كاملة لحساب البائع',
          'رفع القوائم وإدارة الكتالوج',
          'تحديث المنتجات وصيانتها',
          'مراقبة الالتزام بمتطلبات المتاجر',
          'تتبّع الأداء وإعداد التقارير',
          'دعم متعدد المنصات (أمازون، نون، تيك توك شوب، شوبيفاي)',
          'مدير حساب مخصّص',
        ],
        cta: 'ابدأ الآن',
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
