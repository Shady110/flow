import 'server-only'
import { createClient } from '@/lib/supabase/server'
import {
  defaultLandingContent,
  LANDING_SECTIONS,
  type LandingContent,
  type LandingSection,
} from '@/data/landing-content'
import type { Locale } from '@/i18n/config'

type SectionRow = {
  section: LandingSection
  content_en: Record<string, unknown>
  content_ar: Record<string, unknown>
}

function isCustomized(blob: unknown): boolean {
  return !!blob && typeof blob === 'object' && Object.keys(blob as object).length > 0
}

/**
 * Resolve the landing content for a locale, preferring DB-stored values and
 * falling back to the in-code defaults per section. Resilient to the table not
 * existing yet (before migration 0007 runs) so the public site never breaks.
 */
export async function getLandingContent(locale: Locale): Promise<LandingContent> {
  const fallback = defaultLandingContent[locale]
  let rows: SectionRow[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('landing_content')
      .select('section, content_en, content_ar')
    rows = (data as SectionRow[] | null) ?? []
  } catch {
    return fallback
  }

  const bySection = new Map(rows.map((r) => [r.section, r]))
  const result = {} as LandingContent

  for (const section of LANDING_SECTIONS) {
    const row = bySection.get(section)
    const blob = row ? (locale === 'ar' ? row.content_ar : row.content_en) : undefined
    // Use stored content only when an editor has actually saved something.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(result as any)[section] = isCustomized(blob) ? blob : fallback[section]
  }

  return result
}

/** Raw rows (both languages) for the admin editor. */
export async function getLandingContentRows(): Promise<
  Record<LandingSection, { en: Record<string, unknown>; ar: Record<string, unknown> }>
> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('landing_content')
    .select('section, content_en, content_ar')
  const rows = (data as SectionRow[] | null) ?? []
  const bySection = new Map(rows.map((r) => [r.section, r]))

  const out = {} as Record<
    LandingSection,
    { en: Record<string, unknown>; ar: Record<string, unknown> }
  >
  for (const section of LANDING_SECTIONS) {
    const row = bySection.get(section)
    out[section] = {
      en: isCustomized(row?.content_en)
        ? (row!.content_en as Record<string, unknown>)
        : (defaultLandingContent.en[section] as unknown as Record<string, unknown>),
      ar: isCustomized(row?.content_ar)
        ? (row!.content_ar as Record<string, unknown>)
        : (defaultLandingContent.ar[section] as unknown as Record<string, unknown>),
    }
  }
  return out
}
