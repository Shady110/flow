'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/session'
import type { ActionResult } from '@/lib/db/client-actions'
import { generateCaption } from '@/lib/ai/social-copy'
import { costUsd } from '@/lib/ai/pricing'
import { usdToEgp } from '@/lib/ai/fx'
import {
  SOCIAL_PLATFORMS,
  SOCIAL_PILLARS,
  SOCIAL_FORMATS,
  SOCIAL_POST_STATUSES,
} from '@/lib/constants'
import type {
  SocialPlatform,
  SocialPillar,
  SocialFormat,
  SocialPostStatus,
} from '@/lib/types'

const postSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS as [SocialPlatform, ...SocialPlatform[]]),
  pillar: z.enum(SOCIAL_PILLARS as [SocialPillar, ...SocialPillar[]]),
  format: z.enum(SOCIAL_FORMATS as [SocialFormat, ...SocialFormat[]]),
  status: z.enum(SOCIAL_POST_STATUSES as [SocialPostStatus, ...SocialPostStatus[]]).optional(),
  hook: z.string().min(3, 'A hook is required'),
  caption_en: z.string().optional().nullable(),
  caption_ar: z.string().optional().nullable(),
  hashtags: z.array(z.string()).optional(),
  design_brief: z.string().optional().nullable(),
  template: z.string().optional().nullable(),
  scheduled_at: z.string().optional().nullable(),
  link_url: z.string().url('Enter a valid URL').optional().nullable().or(z.literal('')),
  campaign_id: z.string().uuid().optional().nullable(),
  utm_campaign: z.string().optional().nullable(),
  utm_content: z.string().optional().nullable(),
})

function clean<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj }
  for (const k of Object.keys(out)) {
    if (out[k] === '' || out[k] === undefined) (out as Record<string, unknown>)[k] = null
  }
  return out
}

function revalidate() {
  revalidatePath('/social')
  revalidatePath('/')
}

export async function createSocialPostAction(input: unknown): Promise<ActionResult> {
  const parsed = postSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('social_posts')
    .insert(clean({ ...parsed.data, created_by: user?.id ?? null }))
  if (error) return { ok: false, error: error.message }

  revalidate()
  return { ok: true }
}

export async function updateSocialPostAction(id: string, input: unknown): Promise<ActionResult> {
  const parsed = postSchema.partial().safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.from('social_posts').update(clean({ ...parsed.data })).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidate()
  return { ok: true }
}

export async function deleteSocialPostAction(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('social_posts').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidate()
  return { ok: true }
}

/**
 * Move a post along the pipeline.
 *
 * Scheduling is gated on `social.publish` rather than `social.create`: putting
 * something in a queue that will post to the company's audience unattended is a
 * different level of trust from writing a draft, and it is not undoable once it
 * has gone out.
 */
export async function setSocialPostStatusAction(
  id: string,
  status: SocialPostStatus,
): Promise<ActionResult> {
  if (status === 'scheduled' || status === 'published') {
    try {
      await requirePermission('social.publish')
    } catch {
      return { ok: false, error: 'You do not have permission to schedule or publish posts.' }
    }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('social_posts')
    // Clear a stale failure when the post moves on, so an old error message
    // cannot sit next to a post that has since succeeded.
    .update({ status, error: null })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidate()
  return { ok: true }
}

/**
 * Draft both captions with Gemini and save them onto the post.
 *
 * Spend is recorded against the same `ai_usage` ledger the automations use, so
 * the existing spend cards keep showing the real total. Best-effort, in a
 * finally: a ledger write that fails must not lose the caption the user just
 * paid for.
 */
export async function generateCaptionAction(id: string): Promise<ActionResult> {
  try {
    await requirePermission('social.create')
  } catch {
    return { ok: false, error: 'You do not have permission to write posts.' }
  }

  const supabase = await createClient()
  const { data: post } = await supabase
    .from('social_posts')
    .select('id, hook, platform, pillar, format, campaign_id')
    .eq('id', id)
    .maybeSingle()

  if (!post) return { ok: false, error: 'Post not found.' }

  let campaignName: string | null = null
  if (post.campaign_id) {
    const { data } = await supabase
      .from('social_campaigns')
      .select('name')
      .eq('id', post.campaign_id)
      .maybeSingle()
    campaignName = data?.name ?? null
  }

  let usage: Awaited<ReturnType<typeof generateCaption>>['usage'] | null = null
  try {
    const result = await generateCaption({
      hook: post.hook,
      platform: post.platform,
      pillar: post.pillar,
      format: post.format,
      campaign: campaignName,
    })
    usage = result.usage

    const { error } = await supabase
      .from('social_posts')
      .update({
        caption_en: result.value.captionEn,
        caption_ar: result.value.captionAr,
        hashtags: result.value.hashtags,
        // Copy exists now, but the image does not — say so rather than
        // leaving it looking untouched.
        status: 'needs_design',
      })
      .eq('id', id)
    if (error) return { ok: false, error: error.message }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not draft the caption.' }
  } finally {
    // One call, so one ledger row — unlike the automations worker, which
    // accumulates several per item.
    if (usage) {
      try {
        const fxRate = await usdToEgp()
        await supabase.from('ai_usage').insert({
          social_post_id: id,
          model: usage.model,
          images: usage.images,
          input_tokens: usage.inputTokens,
          output_tokens: usage.outputTokens,
          cost_usd: costUsd(usage),
          fx_rate: fxRate,
        })
      } catch {
        // Ledger is best-effort; never fail the caption over it.
      }
    }
  }

  revalidate()
  return { ok: true }
}
