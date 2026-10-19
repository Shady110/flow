'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, requirePermission } from '@/lib/auth/session'
import { getClientContext } from '@/lib/auth/client-session'
import { createDownloadUrl, createUploadUrl, CLIENT_BUCKET } from '@/lib/storage'
import { MARKETPLACES, MAX_UPLOAD_MB, REQUIREMENT_KINDS } from '@/lib/constants'
import type { ActionResult } from '@/lib/db/client-actions'
import type { ClientRequirement } from '@/lib/types'

const kindEnum = z.enum(REQUIREMENT_KINDS as [string, ...string[]])

function refresh(clientId?: string) {
  revalidatePath('/settings/requirements')
  revalidatePath('/documents')
  revalidatePath('/content')
  if (clientId) revalidatePath(`/clients/${clientId}`)
}

// ── Templates (CEO) ─────────────────────────────────────────────────────────

const templateSchema = z.object({
  name: z.string().trim().min(2, 'Give the template a name'),
  kind: kindEnum,
  platform: z.enum(MARKETPLACES as [string, ...string[]]).nullable(),
  items: z
    .array(
      z.object({
        label_en: z.string().trim().min(1, 'Every item needs a name'),
        label_ar: z.string().trim().nullable(),
        hint: z.string().trim().nullable(),
        required: z.boolean(),
      }),
    )
    .min(1, 'Add at least one item'),
})

async function writeItems(templateId: string, items: z.infer<typeof templateSchema>['items']) {
  const supabase = await createClient()
  await supabase.from('requirement_template_items').delete().eq('template_id', templateId)
  const { error } = await supabase.from('requirement_template_items').insert(
    items.map((it, position) => ({
      template_id: templateId,
      label_en: it.label_en,
      label_ar: it.label_ar || null,
      hint: it.hint || null,
      required: it.required,
      position,
    })),
  )
  return error
}

export async function saveTemplateAction(id: string | null, input: unknown): Promise<ActionResult> {
  await requirePermission('requirements.manage')
  const parsed = templateSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const { items, ...head } = parsed.data

  const supabase = await createClient()
  let templateId = id
  if (id) {
    const { error } = await supabase.from('requirement_templates').update(head).eq('id', id)
    if (error) return { ok: false, error: error.message }
  } else {
    const { data, error } = await supabase
      .from('requirement_templates')
      .insert(head)
      .select('id')
      .single()
    if (error || !data) return { ok: false, error: error?.message ?? 'Could not save the template.' }
    templateId = data.id
  }
  const itemsError = await writeItems(templateId!, items)
  if (itemsError) return { ok: false, error: itemsError.message }
  refresh()
  return { ok: true }
}

export async function deleteTemplateAction(id: string): Promise<ActionResult> {
  await requirePermission('requirements.manage')
  const supabase = await createClient()
  const { error } = await supabase.from('requirement_templates').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  refresh()
  return { ok: true }
}

// ── Putting requirements on a client (CEO) ──────────────────────────────────

const applySchema = z.object({
  clientId: z.string().uuid(),
  templateId: z.string().uuid(),
  /** Needed for deliverables; defaults to the client's account on the template's marketplace. */
  platformId: z.string().uuid().nullable(),
})

export async function applyTemplateAction(input: unknown): Promise<ActionResult> {
  await requirePermission('requirements.manage')
  const parsed = applySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const { clientId, templateId } = parsed.data

  const supabase = await createClient()
  const [{ data: tpl }, { data: platforms }] = await Promise.all([
    supabase
      .from('requirement_templates')
      .select('*, items:requirement_template_items(*)')
      .eq('id', templateId)
      .maybeSingle(),
    supabase.from('client_platforms').select('id, platform').eq('client_id', clientId),
  ])
  if (!tpl) return { ok: false, error: 'Template not found.' }

  // Documents may be tied to a marketplace when one is on the client; deliverables must be.
  const platformId =
    parsed.data.platformId ??
    platforms?.find((p) => p.platform === tpl.platform)?.id ??
    null
  if (tpl.kind === 'content_deliverable' && !platformId) {
    return { ok: false, error: 'Add the platform account to this client first, then apply the template.' }
  }

  // Skip items the client already has, so applying twice never duplicates.
  const { data: existing } = await supabase
    .from('client_requirements')
    .select('label_en, platform_id')
    .eq('client_id', clientId)
    .eq('kind', tpl.kind)
  const have = new Set((existing ?? []).map((r) => `${r.platform_id ?? ''}|${r.label_en}`))

  const rows = [...(tpl.items as { label_en: string; label_ar: string | null; hint: string | null; required: boolean; position: number }[])]
    .sort((a, b) => a.position - b.position)
    .filter((it) => !have.has(`${platformId ?? ''}|${it.label_en}`))
    .map((it) => ({
      client_id: clientId,
      platform_id: platformId,
      kind: tpl.kind,
      label_en: it.label_en,
      label_ar: it.label_ar,
      hint: it.hint,
      required: it.required,
      position: it.position,
    }))
  if (rows.length === 0) return { ok: false, error: 'This client already has all of those items.' }

  const { error } = await supabase.from('client_requirements').insert(rows)
  if (error) return { ok: false, error: error.message }
  refresh(clientId)
  return { ok: true }
}

const addSchema = z.object({
  clientId: z.string().uuid(),
  platformId: z.string().uuid().nullable(),
  kind: kindEnum,
  label_en: z.string().trim().min(1, 'Name the item'),
  label_ar: z.string().trim().nullable(),
  required: z.boolean(),
})

export async function addRequirementAction(input: unknown): Promise<ActionResult> {
  await requirePermission('requirements.manage')
  const parsed = addSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const { clientId, platformId, label_ar, ...rest } = parsed.data
  if (rest.kind === 'content_deliverable' && !platformId) {
    return { ok: false, error: 'Pick the platform account this deliverable belongs to.' }
  }
  const supabase = await createClient()
  const { error } = await supabase.from('client_requirements').insert({
    client_id: clientId,
    platform_id: platformId,
    label_ar: label_ar || null,
    ...rest,
  })
  if (error) return { ok: false, error: error.message }
  refresh(clientId)
  return { ok: true }
}

const reviewSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  status: z.enum(['pending', 'approved', 'rejected', 'waived']),
  note: z.string().trim().nullable(),
})

export async function reviewRequirementAction(input: unknown): Promise<ActionResult> {
  await requirePermission('requirements.manage')
  const parsed = reviewSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const { id, clientId, status, note } = parsed.data
  const supabase = await createClient()
  const { error } = await supabase
    .from('client_requirements')
    .update({ status, note: status === 'rejected' ? note || null : null })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }
  refresh(clientId)
  return { ok: true }
}

export async function deleteRequirementAction(id: string, clientId: string): Promise<ActionResult> {
  await requirePermission('requirements.manage')
  const supabase = await createClient()
  const { error } = await supabase.from('client_requirements').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  refresh(clientId)
  return { ok: true }
}

// ── Files (CEO, Content, and the client itself) ─────────────────────────────

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120)
}

/** Load a requirement through RLS, so "can I see it?" is answered by the database. */
async function loadRequirement(id: string): Promise<ClientRequirement | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('client_requirements').select('*').eq('id', id).maybeSingle()
  return (data as ClientRequirement) ?? null
}

/** Can the signed-in person attach a file to this requirement? (The trigger re-checks.) */
async function canUpload(req: ClientRequirement): Promise<boolean> {
  if (req.status === 'approved' || req.status === 'waived') return false
  const user = await getCurrentUser()
  if (user) {
    return (
      user.permissions.has('requirements.manage') ||
      (user.permissions.has('content.workspace') && req.kind === 'content_deliverable')
    )
  }
  const ctx = await getClientContext()
  return !!ctx && req.kind === 'client_document' && ctx.client.id === req.client_id
}

export async function getRequirementUploadUrlAction(
  requirementId: string,
  filename: string,
  size: number,
): Promise<{ ok: true; path: string; token: string } | { ok: false; error: string }> {
  try {
    if (size > MAX_UPLOAD_MB * 1024 * 1024) {
      return { ok: false, error: `Files can be at most ${MAX_UPLOAD_MB} MB.` }
    }
    const req = await loadRequirement(requirementId)
    if (!req || !(await canUpload(req))) return { ok: false, error: 'You can\'t upload to this item.' }
    const path = `${req.client_id}/${req.id}/${Date.now()}-${sanitize(filename)}`
    const { token } = await createUploadUrl(CLIENT_BUCKET, path)
    return { ok: true, path, token }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Upload failed' }
  }
}

/** Mark the slot as submitted once the browser finished the direct upload. */
export async function submitRequirementAction(
  requirementId: string,
  path: string,
  fileName: string,
): Promise<ActionResult> {
  const req = await loadRequirement(requirementId)
  if (!req || !(await canUpload(req))) return { ok: false, error: 'You can\'t upload to this item.' }
  if (!path.startsWith(`${req.client_id}/${req.id}/`)) return { ok: false, error: 'Unexpected file location.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('client_requirements')
    .update({ status: 'submitted', file_path: path, file_name: fileName })
    .eq('id', requirementId)
  if (error) return { ok: false, error: error.message }
  refresh(req.client_id)
  return { ok: true }
}

export async function getRequirementDownloadUrlAction(
  requirementId: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const req = await loadRequirement(requirementId)
    if (!req?.file_path) return { ok: false, error: 'No file uploaded yet.' }
    return { ok: true, url: await createDownloadUrl(CLIENT_BUCKET, req.file_path, 300) }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not open the file' }
  }
}
