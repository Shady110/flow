/**
 * Load the Sep–Dec plan from data/social into the database.
 *
 *   npx tsx scripts/seed-social.ts          # dry run, prints what it would do
 *   npx tsx scripts/seed-social.ts --write  # actually writes
 *
 * Idempotent. Campaigns upsert on `slug`; posts match on (date, platform, hook)
 * because a planned post has no natural key until it exists — running twice
 * updates rather than duplicating, so the file stays the source of truth and
 * edits to it can be re-applied.
 *
 * Uses the service-role client: this is an operator script run from a terminal,
 * not a request, so there is no session for RLS to read.
 */
import { createClient } from '@supabase/supabase-js'
import { SOCIAL_PLAN, CAMPAIGNS, isWritten } from '../data/social'
import type { PlannedPost } from '../data/social'

const WRITE = process.argv.includes('--write')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.')
  process.exit(1)
}

const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

/**
 * Posts go out mid-morning and early evening Cairo time. The plan carries dates,
 * not times — a time per row would be false precision on something the team
 * will adjust anyway.
 */
function scheduledAt(post: PlannedPost): string {
  const hour = post.platform === 'linkedin' ? 9 : 19
  return new Date(`${post.date}T${String(hour).padStart(2, '0')}:00:00+02:00`).toISOString()
}

/** Written posts are ready to design; brief-only rows are still ideas. */
function statusFor(post: PlannedPost): string {
  return isWritten(post) ? 'needs_design' : 'idea'
}

async function main() {
  console.log(`${WRITE ? 'Writing' : 'Dry run —'} ${CAMPAIGNS.length} campaigns, ${SOCIAL_PLAN.length} posts\n`)

  const campaignIds = new Map<string, string>()

  for (const c of CAMPAIGNS) {
    if (!WRITE) {
      console.log(`  campaign  ${c.slug.padEnd(24)} ${c.startsAt} → ${c.endsAt}`)
      continue
    }
    const { data, error } = await db
      .from('social_campaigns')
      .upsert(
        {
          slug: c.slug,
          name: c.name,
          starts_at: c.startsAt,
          ends_at: c.endsAt,
          goal: c.goal,
          colour: c.colour,
          dates_provisional: c.datesProvisional ?? false,
        },
        { onConflict: 'slug' },
      )
      .select('id, slug')
      .single()
    if (error) throw new Error(`campaign ${c.slug}: ${error.message}`)
    campaignIds.set(data.slug, data.id)
  }

  let created = 0
  let updated = 0

  for (const p of SOCIAL_PLAN) {
    const row = {
      campaign_id: p.campaign ? (campaignIds.get(p.campaign) ?? null) : null,
      platform: p.platform,
      pillar: p.pillar,
      format: p.format,
      status: statusFor(p),
      hook: p.hook,
      caption_en: p.captionEn ?? null,
      caption_ar: p.captionAr ?? null,
      hashtags: p.hashtags ?? [],
      design_brief: p.designBrief ?? null,
      template: p.template ?? null,
      scheduled_at: scheduledAt(p),
    }

    if (!WRITE) {
      console.log(`  ${p.date}  ${p.platform.padEnd(10)} ${statusFor(p).padEnd(13)} ${p.hook.slice(0, 52)}`)
      continue
    }

    // Match on the three fields that identify a planned slot.
    const { data: existing } = await db
      .from('social_posts')
      .select('id')
      .eq('platform', p.platform)
      .eq('hook', p.hook)
      .gte('scheduled_at', `${p.date}T00:00:00Z`)
      .lte('scheduled_at', `${p.date}T23:59:59Z`)
      .maybeSingle()

    if (existing) {
      const { error } = await db.from('social_posts').update(row).eq('id', existing.id)
      if (error) throw new Error(`update ${p.date} ${p.hook}: ${error.message}`)
      updated++
    } else {
      const { error } = await db.from('social_posts').insert(row)
      if (error) throw new Error(`insert ${p.date} ${p.hook}: ${error.message}`)
      created++
    }
  }

  if (WRITE) {
    console.log(`\nDone. ${created} created, ${updated} updated.`)
  } else {
    const written = SOCIAL_PLAN.filter(isWritten).length
    console.log(`\n${written} of ${SOCIAL_PLAN.length} posts have both captions.`)
    console.log('Nothing written. Re-run with --write to apply.')
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
