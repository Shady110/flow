'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/session'
import { LANDING_SECTIONS } from '@/data/landing-content'
import type { ActionResult } from '@/lib/db/client-actions'

const schema = z.object({
  section: z.enum(LANDING_SECTIONS),
  content_en: z.record(z.string(), z.unknown()),
  content_ar: z.record(z.string(), z.unknown()),
})

/**
 * Upsert one landing-page section's bilingual content. Gated by content.manage
 * (RLS enforces the same at the DB layer). Revalidates the marketing site so
 * edits appear immediately.
 */
export async function updateLandingSectionAction(input: unknown): Promise<ActionResult> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Invalid content payload.' }

  const user = await requirePermission('content.manage')
  const supabase = await createClient()

  const { error } = await supabase.from('landing_content').upsert(
    {
      section: parsed.data.section,
      content_en: parsed.data.content_en,
      content_ar: parsed.data.content_ar,
      updated_by: user.id,
    },
    { onConflict: 'section' },
  )
  if (error) return { ok: false, error: error.message }

  revalidatePath('/', 'layout')
  return { ok: true }
}
