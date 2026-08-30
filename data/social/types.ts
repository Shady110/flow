/**
 * The Sep–Dec 2026 social plan, as data.
 *
 * This file is the contract; the month files hold the entries. It exists as
 * typed data rather than a document because it seeds `social_posts` — the
 * calendar arrives already populated in /internal/social instead of being
 * retyped from a PDF.
 *
 * Two rules from docs/flow-handbook.en.md constrain every caption written here,
 * and they are not style preferences:
 *
 *   §6  Never promise a specific delivery date without production confirming it.
 *       So no "ready in 14 days". Urgency comes from booking cut-offs, which are
 *       capacity statements we control, not delivery promises we cannot.
 *   §10 Never guarantee a sales figure, a search ranking, or page-one placement.
 *       So the proof pillar leans on work we can show — the real catalogue —
 *       never on invented client results.
 */

export type Platform = 'instagram' | 'facebook' | 'linkedin'

/**
 * What a post is *for*. Every entry carries one, so the month can be audited
 * for balance — five proof posts and no teaching is a month that shows off
 * without earning trust.
 */
export type Pillar =
  /** The work itself: before/after, catalogue, shoot results. */
  | 'proof'
  /** Marketplace mechanics a seller can act on today. */
  | 'teach'
  /** How FLOW works — the six steps, the studio, the review pass. */
  | 'process'
  /** Pricing, packages, seasonal deadlines. Used sparingly on purpose. */
  | 'offer'
  /** Egypt e-commerce and marketplace policy movement. */
  | 'pulse'

export type Format = 'reel' | 'carousel' | 'static' | 'story' | 'text' | 'article'

export interface PlannedPost {
  /** ISO date. Time of day is set per platform at schedule time. */
  date: string
  platform: Platform
  pillar: Pillar
  format: Format
  /** Campaign slug from CAMPAIGNS, when the post belongs to one. */
  campaign?: string
  /** The idea in one line. Always present, including on brief-only entries. */
  hook: string
  /** Written copy. Present for September and the peak campaigns. */
  captionEn?: string
  captionAr?: string
  hashtags?: string[]
  /** What the image or video has to show, for the design step. */
  designBrief?: string
  /** Which render template this maps to, once /api/social/render exists. */
  template?: string
}

export interface Campaign {
  slug: string
  name: string
  startsAt: string
  endsAt: string
  goal: string
  /** Brand token used for the campaign chip in the dashboard. */
  colour: string
  /** Set when the window depends on an announcement we do not control. */
  datesProvisional?: boolean
}

/** The standing weekly rhythm. Egypt's working week is Sun–Thu. */
export const WEEKLY_RHYTHM = {
  instagram: ['Sun', 'Tue', 'Thu', 'Sat'],
  facebook: ['Sun', 'Wed', 'Fri'],
  linkedin: ['Mon', 'Wed'],
} as const

/** One CTA across every platform, so the funnel has a single door. */
export const AUDIT_CTA = {
  en: 'Comment or DM "AUDIT" and we will pull apart one of your live listings — free, no pitch.',
  ar: 'اكتب "مراجعة" في كومنت أو رسالة، وهنفكّك لك واحد من منتجاتك المنشورة — مجانًا وبدون أي التزام.',
} as const
