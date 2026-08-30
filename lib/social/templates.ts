/**
 * Render constants shared by the server renderer and the composer UI.
 *
 * Deliberately free of `import 'server-only'` and of anything touching `fs`:
 * the composer is a client component and needs the template and size lists to
 * build its pickers. Font loading lives in `render.ts`, which *is* server-only —
 * pulling that into the client bundle is what broke the build the first time,
 * and it is the same hazard lib/constants.ts documents at the top of the file.
 */

/** The brand tokens as literals, because Satori resolves no CSS variables. */
export const BRAND = {
  green: '#143C28',
  greenDeep: '#0B2417',
  green950: '#08170E',
  lime: '#C4F075',
  bone: '#FBFBF7',
  boneSoft: '#F4F7EC',
  ink: '#10231A',
  inkMuted: '#55685C',
  onDark: '#F4F7EC',
  onDarkMuted: 'rgba(244,247,236,0.62)',
  border: '#DEE9D0',
} as const

/** Post sizes, named by where they are used rather than by their numbers. */
export const SIZES = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  wide: { width: 1200, height: 627 },
} as const

export type SizeKey = keyof typeof SIZES

export const TEMPLATES = [
  'statement-dark',
  'stat-card',
  'quote-dark',
  'offer-dark',
  'checklist',
  'compare-2up',
  'carousel-cover',
  'reel-cover',
  'price-card',
  'timeline-light',
] as const

export type TemplateKey = (typeof TEMPLATES)[number]

/** Templates that sit on the bone ground rather than the dark panel. */
export const LIGHT_TEMPLATES: readonly TemplateKey[] = [
  'checklist',
  'timeline-light',
  'price-card',
]

/**
 * The plan in data/social/ was written against a richer vocabulary than the
 * renderer implements — `carousel-teach`, `reel-grid`, `annotated-ui` and so
 * on. Several of those describe the same artwork with different content, and a
 * few describe things a still image cannot be (a reel is video).
 *
 * Rather than either building fifteen near-identical templates or silently
 * falling back to one, each planned key maps onto the closest real template.
 * The mapping is the honest statement of what a still can and cannot do:
 * anything `reel-*` renders a cover frame, anything `carousel-*` renders a
 * cover slide, and the remaining slides stay a design brief for a person.
 */
const PLANNED_TEMPLATE_MAP: Record<string, TemplateKey> = {
  'carousel-timeline': 'timeline-light',
  'carousel-categories': 'carousel-cover',
  'carousel-teach': 'carousel-cover',
  'reel-process': 'reel-cover',
  'reel-grid': 'reel-cover',
  'reel-marketplaces': 'reel-cover',
  'compare-2up': 'compare-2up',
  'annotated-ui': 'compare-2up',
  'timeline-light': 'timeline-light',
  'price-card': 'price-card',
}

/** Resolve a planned template key to one the renderer can actually draw. */
export function resolveTemplate(planned: string | null | undefined): TemplateKey {
  if (!planned) return 'statement-dark'
  if ((TEMPLATES as readonly string[]).includes(planned)) return planned as TemplateKey
  return PLANNED_TEMPLATE_MAP[planned] ?? 'statement-dark'
}

/** Which frame each platform wants by default. */
export const PLATFORM_SIZE = {
  instagram: 'portrait',
  facebook: 'square',
  linkedin: 'wide',
} as const satisfies Record<string, SizeKey>
