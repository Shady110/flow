'use server'

import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { createUploadUrl, createDownloadUrl, downloadBuffer, INPUT_BUCKET, OUTPUT_BUCKET } from '@/lib/storage'
import { parseSheet } from '@/lib/automation/xlsx'
import { mapRowToCanonical } from '@/lib/automation/listing'
import type { CanonicalKey } from '@/lib/automation/marketplaces'
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

export async function createListingJobAction(input: {
  inputPath: string
  marketplace: string
  mapping: Partial<Record<CanonicalKey, string>>
  clientId?: string | null
}): Promise<ActionResult & { jobId?: string }> {
  try {
    const user = await requireAutomation()
    const supabase = await createClient()

    const buf = await downloadBuffer(INPUT_BUCKET, input.inputPath)
    const { rows } = parseSheet(buf)
    if (rows.length === 0) return { ok: false, error: 'The sheet has no data rows.' }

    const { data: job, error } = await supabase
      .from('automation_jobs')
      .insert({
        type: 'listing',
        status: 'processing',
        client_id: input.clientId ?? null,
        marketplace: input.marketplace,
        params: { mapping: input.mapping },
        input_path: input.inputPath,
        total: rows.length,
        created_by: user.id,
      })
      .select('id')
      .single()
    if (error) return { ok: false, error: error.message }

    const items = rows.map((row, i) => ({
      job_id: job.id,
      position: i,
      status: 'queued',
      input: { canonical: mapRowToCanonical(row, input.mapping) },
    }))
    const { error: itemErr } = await supabase.from('automation_items').insert(items)
    if (itemErr) return { ok: false, error: itemErr.message }

    revalidatePath('/automations')
    return { ok: true, jobId: job.id }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not create the job' }
  }
}

/** Signed download URL for a finished job's output file. */
export async function getJobDownloadUrlAction(
  jobId: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    await requireAutomation()
    const supabase = await createClient()
    const { data: job } = await supabase
      .from('automation_jobs')
      .select('output_path')
      .eq('id', jobId)
      .maybeSingle()
    if (!job?.output_path) return { ok: false, error: 'Output not ready yet.' }
    const url = await createDownloadUrl(OUTPUT_BUCKET, job.output_path, 3600)
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
