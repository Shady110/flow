'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { createUploadUrl, createDownloadUrl, downloadBuffer, INPUT_BUCKET, OUTPUT_BUCKET } from '@/lib/storage'
import { parseSheet } from '@/lib/automation/xlsx'
import { parseCollectingSheet } from '@/lib/automation/collecting'
import { detectReceivingColumns, reviewReasons } from '@/lib/automation/listing-rules'
import {
  CONSTANT_LABELS,
  bucketOf,
  parseAmazonTemplate,
} from '@/lib/automation/amazon-template'
import type { ListingStage } from '@/lib/types'
import type { ActionResult } from '@/lib/db/client-actions'

async function requireAutomation() {
  const user = await getCurrentUser()
  if (!user?.permissions.has('automation.run')) throw new Error('Not authorized')
  return user
}

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

/** Signed upload URL for a browser direct-upload into automation-inputs. */
export async function getUploadUrlAction(
  folder: string,
  filename: string,
): Promise<{ ok: true; path: string; token: string } | { ok: false; error: string }> {
  try {
    await requireAutomation()
    const path = `${folder}/${sanitize(filename)}`
    const { token } = await createUploadUrl(INPUT_BUCKET, path)
    return { ok: true, path, token }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Upload failed' }
  }
}

/** Read an uploaded sheet and return its headers + row count for the mapping UI. */
export async function parseSheetAction(
  path: string,
): Promise<{ ok: true; headers: string[]; rowCount: number } | { ok: false; error: string }> {
  try {
    await requireAutomation()
    const buf = await downloadBuffer(INPUT_BUCKET, path)
    const { headers, rows } = parseSheet(buf)
    return { ok: true, headers, rowCount: rows.length }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not read the sheet' }
  }
}

/** What the wizard needs to render the constants form for an uploaded template. */
export interface TemplateSummary {
  productType: string
  fieldCount: number
  generateCount: number
  constants: { key: string; label: string; values: string[] }[]
}

/** Parse an uploaded Amazon flat file and hand back its own dropdown lists. */
export async function parseTemplateAction(
  path: string,
): Promise<{ ok: true; summary: TemplateSummary } | { ok: false; error: string }> {
  try {
    await requireAutomation()
    const template = parseAmazonTemplate(await downloadBuffer(INPUT_BUCKET, path))

    // Every constant is offered as a select over the template's own Valid
    // Values, so an out-of-list answer is impossible by construction.
    const seen = new Set<string>()
    const constants: TemplateSummary['constants'] = []
    for (const f of template.fields) {
      const key = CONSTANT_LABELS[f.label]
      if (!key || seen.has(key)) continue
      seen.add(key)
      constants.push({ key, label: f.label, values: f.values ?? [] })
    }

    return {
      ok: true,
      summary: {
        productType: template.productType,
        fieldCount: template.fields.length,
        generateCount: template.fields.filter((f) => bucketOf(f) === 'generate').length,
        constants,
      },
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not read the template' }
  }
}

export async function createListingJobAction(input: {
  inputPath: string
  stage: ListingStage
  skuColumn?: string
  titleColumn?: string
  templatePath?: string
  constants?: Record<string, string>
  clientId?: string | null
}): Promise<ActionResult & { jobId?: string }> {
  try {
    const user = await requireAutomation()
    const supabase = await createClient()

    if (input.stage !== 'collecting' && !input.templatePath) {
      return { ok: false, error: 'Upload the Amazon template for this stage.' }
    }

    const buf = await downloadBuffer(INPUT_BUCKET, input.inputPath)

    // The Amazon-only stage consumes a collecting sheet you have already
    // corrected, so nothing is regenerated and nothing is re-billed.
    let items: { sku: string; orgTitle: string; collecting?: unknown }[]
    if (input.stage === 'amazon') {
      const rows = parseCollectingSheet(buf)
      if (rows.length === 0) return { ok: false, error: 'That collecting sheet has no data rows.' }
      const missing = rows.filter((r) => !r.sku || !r.title).length
      if (missing > 0) {
        return { ok: false, error: `${missing} row(s) are missing a SKU or Title. Fill them in and re-upload.` }
      }
      items = rows.map((r) => ({ sku: r.sku, orgTitle: r.orgTitle, collecting: r }))
    } else {
      const { headers, rows } = parseSheet(buf)
      if (rows.length === 0) return { ok: false, error: 'The sheet has no data rows.' }
      const detected = detectReceivingColumns(headers)
      const skuCol = input.skuColumn || detected.sku
      const titleCol = input.titleColumn || detected.title
      if (!skuCol || !titleCol) {
        return { ok: false, error: 'Could not find the SKU and title columns in that sheet.' }
      }
      items = rows.map((r) => ({
        sku: String(r[skuCol] ?? '').trim(),
        orgTitle: String(r[titleCol] ?? '').trim(),
      }))
      const blank = items.filter((i) => !i.sku).length
      if (blank > 0) return { ok: false, error: `${blank} row(s) have no SKU.` }
    }

    // Thin and duplicated titles are flagged before a single token is spent —
    // four SKUs sharing one title would otherwise become four identical listings.
    const reasons = reviewReasons(items.map((i) => i.orgTitle))

    const { data: job, error } = await supabase
      .from('automation_jobs')
      .insert({
        type: 'listing',
        status: 'processing',
        client_id: input.clientId ?? null,
        marketplace: 'amazon',
        params: {
          stage: input.stage,
          templatePath: input.templatePath ?? null,
          constants: input.constants ?? {},
        },
        input_path: input.inputPath,
        total: items.length,
        created_by: user.id,
      })
      .select('id')
      .single()
    if (error) return { ok: false, error: error.message }

    const { error: itemErr } = await supabase.from('automation_items').insert(
      items.map((it, i) => ({
        job_id: job.id,
        position: i,
        status: 'queued',
        input: { ...it, reviewReason: reasons[i] },
      })),
    )
    if (itemErr) return { ok: false, error: itemErr.message }

    revalidatePath('/automations')
    return { ok: true, jobId: job.id }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not create the job' }
  }
}

/** Requeue only the failed items of a job and set it processing again. */
export async function retryFailedItemsAction(jobId: string): Promise<ActionResult> {
  try {
    await requireAutomation()
    const supabase = await createClient()
    const { error } = await supabase
      .from('automation_items')
      .update({ status: 'queued', error: null })
      .eq('job_id', jobId)
      .eq('status', 'failed')
    if (error) return { ok: false, error: error.message }
    await supabase.from('automation_jobs').update({ status: 'processing' }).eq('id', jobId)
    revalidatePath(`/automations/${jobId}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Retry failed' }
  }
}

/** Delete a job and its items. Files in storage are left to bucket lifecycle. */
export async function deleteJobAction(jobId: string): Promise<ActionResult> {
  try {
    await requireAutomation()
    const supabase = await createClient()
    const { error } = await supabase.from('automation_jobs').delete().eq('id', jobId)
    if (error) return { ok: false, error: error.message }
    revalidatePath('/automations')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Delete failed' }
  }
}

/** Signed download URL for a finished job's output file. */
export async function getJobDownloadUrlAction(
  jobId: string,
  which?: 'collecting' | 'amazon',
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    await requireAutomation()
    const supabase = await createClient()
    const { data: job } = await supabase
      .from('automation_jobs')
      .select('output_path, params')
      .eq('id', jobId)
      .maybeSingle()
    const outputs = (job?.params as { outputs?: Record<string, string> } | null)?.outputs
    const path = (which && outputs?.[which]) || job?.output_path
    if (!path) return { ok: false, error: 'Output not ready yet.' }
    const url = await createDownloadUrl(OUTPUT_BUCKET, path, 3600)
    return { ok: true, url }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Download failed' }
  }
}

export async function createImageJobAction(input: {
  products: { sku: string; paths: string[] }[]
  clientId?: string | null
}): Promise<ActionResult & { jobId?: string }> {
  try {
    const user = await requireAutomation()
    const supabase = await createClient()

    const valid = input.products.filter((p) => p.paths.length >= 2)
    if (valid.length === 0) {
      return { ok: false, error: 'Each product needs at least 2 images.' }
    }

    const { data: job, error } = await supabase
      .from('automation_jobs')
      .insert({
        type: 'image',
        status: 'processing',
        client_id: input.clientId ?? null,
        total: valid.length,
        created_by: user.id,
      })
      .select('id')
      .single()
    if (error) return { ok: false, error: error.message }

    const items = valid.map((p, i) => ({
      job_id: job.id,
      position: i,
      status: 'queued',
      input: { sku: p.sku, images: p.paths },
    }))
    const { error: itemErr } = await supabase.from('automation_items').insert(items)
    if (itemErr) return { ok: false, error: itemErr.message }

    revalidatePath('/automations')
    return { ok: true, jobId: job.id }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not create the job' }
  }
}

/** Bounded by what finalizeImages can zip inside one request. */
const MAX_CLEAN_IMAGES = 500

/**
 * Clean-up job: one item per image, each cleaned onto a white background.
 * Shares the 'image' job type — params.mode tells the processor which path to
 * take, which keeps the type CHECK constraint (and the schema) untouched.
 *
 * `name` is the relative output key from outputKeys() — e.g. 'SKU-1001/front'.
 * It lands in the item's `sku` field and carries the folder structure all the
 * way through to the zip.
 */
export async function createImageCleanJobAction(input: {
  images: { name: string; path: string }[]
  clientId?: string | null
}): Promise<ActionResult & { jobId?: string }> {
  try {
    const user = await requireAutomation()
    const supabase = await createClient()

    if (input.images.length === 0) return { ok: false, error: 'Add at least one image.' }
    // Refuse up front rather than burning the API budget and then failing at the
    // single-request zip step, which would leave nothing downloadable.
    if (input.images.length > MAX_CLEAN_IMAGES) {
      return {
        ok: false,
        error: `That's ${input.images.length} images — the limit per job is ${MAX_CLEAN_IMAGES}. Split it into smaller batches.`,
      }
    }

    const { data: job, error } = await supabase
      .from('automation_jobs')
      .insert({
        type: 'image',
        status: 'processing',
        client_id: input.clientId ?? null,
        params: { mode: 'clean' },
        total: input.images.length,
        created_by: user.id,
      })
      .select('id')
      .single()
    if (error) return { ok: false, error: error.message }

    const items = input.images.map((img, i) => ({
      job_id: job.id,
      position: i,
      status: 'queued',
      input: { sku: img.name, images: [img.path] },
    }))
    const { error: itemErr } = await supabase.from('automation_items').insert(items)
    if (itemErr) return { ok: false, error: itemErr.message }

    revalidatePath('/automations')
    return { ok: true, jobId: job.id }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not create the job' }
  }
}
