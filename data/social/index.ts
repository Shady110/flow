import type { PlannedPost, Platform, Pillar } from './types'
import { SEPTEMBER } from './september'
import { OCTOBER } from './october'
import { NOVEMBER } from './november'
import { DECEMBER } from './december'

export * from './types'
export { CAMPAIGNS, KEY_DATES } from './campaigns'
export { BOOKING_CUTOFF } from './october'

/** The whole Sep–Dec 2026 plan, chronological. */
export const SOCIAL_PLAN: PlannedPost[] = [
  ...SEPTEMBER,
  ...OCTOBER,
  ...NOVEMBER,
  ...DECEMBER,
].sort((a, b) => a.date.localeCompare(b.date))

export { SEPTEMBER, OCTOBER, NOVEMBER, DECEMBER }

/** A post is ready to schedule once both languages are written. */
export function isWritten(post: PlannedPost): boolean {
  return Boolean(post.captionEn && post.captionAr)
}

/**
 * Plan stats, computed rather than stated — a hand-written count in a README
 * goes stale the first time someone adds a post.
 */
export function planSummary() {
  const byPlatform = {} as Record<Platform, number>
  const byPillar = {} as Record<Pillar, number>
  for (const p of SOCIAL_PLAN) {
    byPlatform[p.platform] = (byPlatform[p.platform] ?? 0) + 1
    byPillar[p.pillar] = (byPillar[p.pillar] ?? 0) + 1
  }
  return {
    total: SOCIAL_PLAN.length,
    written: SOCIAL_PLAN.filter(isWritten).length,
    byPlatform,
    byPillar,
  }
}
