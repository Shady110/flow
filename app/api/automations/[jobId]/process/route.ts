import { NextResponse, type NextRequest } from 'next/server'
import JSZip from 'jszip'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { downloadBuffer, uploadBuffer, INPUT_BUCKET, OUTPUT_BUCKET } from '@/lib/storage'
import { processListingRow } from '@/lib/automation/listing'
import { toWhiteCanvas } from '@/lib/automation/image'
import { buildWorkbook } from '@/lib/automation/xlsx'
import { generateProductImage, cleanupProductImage, type RefImage } from '@/lib/ai/gemini'
import { costUsd, type AiUsage } from '@/lib/ai/pricing'
import { usdToEgp } from '@/lib/ai/fx'
import { getMarketplace } from '@/lib/automation/marketplaces'
import type { AutomationItem, AutomationJob } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 300

const ANGLES = ['front', 'side', 'back'] as const
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function mimeFromPath(p: string) {
  const ext = p.split('.').pop()?.toLowerCase()
  return ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
}

async function readRef(path: string): Promise<RefImage> {
  return {
    mimeType: mimeFromPath(path),
    base64: (await downloadBuffer(INPUT_BUCKET, path)).toString('base64'),
  }
}

/** Clean mode: one source photo in, one white-background photo out. */
async function processCleanItem(jobId: string, item: AutomationItem, usage: AiUsage[]) {
  const input = item.input as { sku: string; images: string[] }
  const billed = await cleanupProductImage(await readRef(input.images[0]))
  // Push before post-processing: toWhiteCanvas rejects dirty backgrounds, and a
  // rejected frame was still paid for.
  usage.push(billed.usage)
  const jpg = await toWhiteCanvas(billed.value)
  const outPath = `${jobId}/${input.sku}.jpg`
  await uploadBuffer(OUTPUT_BUCKET, outPath, jpg, 'image/jpeg')
  return { sku: input.sku, images: { clean: outPath } }
}

/** Angle mode: 2+ reference photos in, generated front/side/back out. */
async function processImageItem(jobId: string, item: AutomationItem, usage: AiUsage[]) {
  const input = item.input as { sku: string; images: string[] }
  const refs: RefImage[] = await Promise.all(input.images.map(readRef))

  const images: Record<string, string> = {}
  for (const angle of ANGLES) {
    const billed = await generateProductImage(refs, angle)
    usage.push(billed.usage)
    const jpg = await toWhiteCanvas(billed.value)
    const outPath = `${jobId}/${input.sku}_${angle}.jpg`
    await uploadBuffer(OUTPUT_BUCKET, outPath, jpg, 'image/jpeg')
    images[angle] = outPath
    await sleep(800) // gentle pacing between angle generations
  }
  return { sku: input.sku, images }
}

async function finalizeListing(job: AutomationJob, supabase: Awaited<ReturnType<typeof createClient>>) {
  const marketplace = getMarketplace(job.marketplace ?? '')
  if (!marketplace) return
  const { data: items } = await supabase
    .from('automation_items')
    .select('output')
    .eq('job_id', job.id)
    .eq('status', 'done')
    .order('position')
  const headers = marketplace.columns.map((c) => c.header)
  const rows = ((items as { output: Record<string, string> }[]) ?? []).map((i) => i.output ?? {})
  const buf = buildWorkbook(headers, rows)
  const path = `${job.id}/${marketplace.key}-listings.xlsx`
  await uploadBuffer(
    OUTPUT_BUCKET,
    path,
    buf,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  return path
}

// ponytail: downloads every output and builds the whole zip in memory in one
// request (maxDuration 300s). Fine up to the MAX_CLEAN_IMAGES cap in
// automation-actions.ts (~150MB at 2000x2000/q95); if that cap starts hurting,
// switch to per-SKU zips assembled across calls rather than raising it.
async function finalizeImages(job: AutomationJob, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: items } = await supabase
    .from('automation_items')
    .select('output')
    .eq('job_id', job.id)
    .eq('status', 'done')
  const zip = new JSZip()
  for (const it of (items as { output: { sku: string; images: Record<string, string> } }[]) ?? []) {
    if (!it.output?.images) continue
    for (const [angle, path] of Object.entries(it.output.images)) {
      const buf = await downloadBuffer(OUTPUT_BUCKET, path)
      // Clean mode has a single output per source, so it keeps the plain name.
      zip.file(angle === 'clean' ? `${it.output.sku}.jpg` : `${it.output.sku}_${angle}.jpg`, buf)
    }
  }
  const zipBuf = await zip.generateAsync({ type: 'nodebuffer' })
  const path = `${job.id}/images.zip`
  await uploadBuffer(OUTPUT_BUCKET, path, zipBuf, 'application/zip')
  return path
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  const user = await getCurrentUser()
  if (!user?.permissions.has('automation.run')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data: job } = await supabase.from('automation_jobs').select('*').eq('id', jobId).maybeSingle()
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const j = job as AutomationJob

  if (j.status === 'done' || j.status === 'failed') {
    return NextResponse.json({ done: j.done_count, failed: j.failed_count, total: j.total, remaining: 0 })
  }

  // One item per call keeps each request short and avoids bursting the rate limit;
  // withRetry() handles pacing/backoff on 429s.
  const chunk = 1
  const { data: queued } = await supabase
    .from('automation_items')
    .select('*')
    .eq('job_id', jobId)
    .eq('status', 'queued')
    .order('position')
    .limit(chunk)

  const clean = (j.params as { mode?: string }).mode === 'clean'

  for (const item of (queued as AutomationItem[]) ?? []) {
    await supabase.from('automation_items').update({ status: 'processing' }).eq('id', item.id)
    const usage: AiUsage[] = []
    try {
      const output =
        j.type === 'listing'
          ? await processListingRow(
              (item.input as { canonical: Record<string, string> }).canonical,
              j.marketplace ?? '',
              usage,
            )
          : clean
            ? await processCleanItem(jobId, item, usage)
            : await processImageItem(jobId, item, usage)
      await supabase.from('automation_items').update({ status: 'done', output }).eq('id', item.id)
    } catch (e) {
      await supabase
        .from('automation_items')
        .update({ status: 'failed', error: e instanceof Error ? e.message : 'Failed' })
        .eq('id', item.id)
    } finally {
      // Records spend whether the item ended done or failed — the model was paid
      // either way. Never let a ledger write break the job itself.
      if (usage.length > 0) {
        try {
          const fxRate = await usdToEgp()
          await supabase.from('ai_usage').insert(
            usage.map((u) => ({
              job_id: jobId,
              item_id: item.id,
              model: u.model,
              images: u.images,
              input_tokens: u.inputTokens,
              output_tokens: u.outputTokens,
              cost_usd: costUsd(u),
              fx_rate: fxRate,
            })),
          )
        } catch {
          /* ledger is best-effort */
        }
      }
    }
  }

  // Recompute progress.
  const { data: all } = await supabase.from('automation_items').select('status').eq('job_id', jobId)
  const statuses = (all as { status: string }[]) ?? []
  const done = statuses.filter((s) => s.status === 'done').length
  const failed = statuses.filter((s) => s.status === 'failed').length
  const remaining = statuses.length - done - failed

  const patch: Record<string, unknown> = { done_count: done, failed_count: failed }
  if (remaining === 0) {
    try {
      const outputPath = j.type === 'listing' ? await finalizeListing(j, supabase) : await finalizeImages(j, supabase)
      patch.output_path = outputPath
      patch.status = failed === statuses.length ? 'failed' : 'done'
    } catch (e) {
      patch.status = 'failed'
      patch.error = e instanceof Error ? e.message : 'Finalization failed'
    }
  }
  await supabase.from('automation_jobs').update(patch).eq('id', jobId)

  return NextResponse.json({ done, failed, total: statuses.length, remaining })
}
