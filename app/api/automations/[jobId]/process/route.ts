import { NextResponse, type NextRequest } from 'next/server'
import JSZip from 'jszip'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { downloadBuffer, uploadBuffer, INPUT_BUCKET, OUTPUT_BUCKET } from '@/lib/storage'
import { runCollecting, runAmazon, buildAmazonRow } from '@/lib/automation/listing'
import { addReason } from '@/lib/automation/listing-rules'
import { buildCollectingSheet, type CollectingRow } from '@/lib/automation/collecting'
import { parseAmazonTemplate, type AmazonTemplate } from '@/lib/automation/amazon-template'
import { toWhiteCanvas } from '@/lib/automation/image'
import { writeIntoTemplate } from '@/lib/automation/xlsx'
import { generateProductImage, cleanupProductImage, type RefImage } from '@/lib/ai/gemini'
import { costUsd, type AiUsage } from '@/lib/ai/pricing'
import { usdToEgp } from '@/lib/ai/fx'
import type { AutomationItem, AutomationJob, ListingJobParams } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 300

const ANGLES = ['front', 'side', 'back'] as const
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const XLSM_MIME = 'application/vnd.ms-excel.sheet.macroEnabled.12'

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

/**
 * Parsing a 1.2 MB flat file costs a second or two, so hold it for the life of
 * the container. One parse per batch of items, not one per item.
 */
const templateCache = new Map<string, AmazonTemplate>()
async function loadTemplate(path: string): Promise<AmazonTemplate> {
  const hit = templateCache.get(path)
  if (hit) return hit
  const parsed = parseAmazonTemplate(await downloadBuffer(INPUT_BUCKET, path))
  templateCache.set(path, parsed)
  return parsed
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

interface ListingOutput {
  collecting: CollectingRow
  /** Flat-file cells indexed by Template column. Absent on collecting-only jobs. */
  amazon?: string[]
}

/** One product through the pipeline: receiving -> collecting -> Amazon row. */
async function processListingItem(
  item: AutomationItem,
  params: ListingJobParams,
  template: AmazonTemplate | null,
  usage: AiUsage[],
): Promise<ListingOutput> {
  const input = item.input as {
    sku: string
    orgTitle: string
    collecting?: CollectingRow
    reviewReason?: string
  }

  // The Amazon-only stage starts from a collecting sheet you have already
  // reviewed, so stage A is skipped entirely — no second bill for the same row.
  let row: CollectingRow
  if (params.stage === 'amazon' && input.collecting) {
    row = input.collecting
  } else {
    row = await runCollecting(input.sku, input.orgTitle, usage, params.constants?.brand)
    if (input.reviewReason) row.needsReview = addReason(row.needsReview, input.reviewReason)
  }

  if (params.stage === 'collecting' || !template) return { collecting: row }

  const generated = await runAmazon(row, template, usage)
  return { collecting: row, amazon: buildAmazonRow(template, row, params.constants ?? {}, generated) }
}

/**
 * Run `fn` over items with a bounded number in flight. A sliding window rather
 * than Promise.all over everything: 40 concurrent Gemini calls would trip the
 * rate limit that withRetry then has to unwind.
 */
async function pool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) await fn(items[next++])
    }),
  )
}

async function finalizeListing(
  job: AutomationJob,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const params = job.params as unknown as ListingJobParams
  const { data: items } = await supabase
    .from('automation_items')
    .select('output')
    .eq('job_id', job.id)
    .eq('status', 'done')
    .order('position')

  const outputs = ((items as { output: ListingOutput }[]) ?? []).map((i) => i.output).filter(Boolean)
  const paths: { collecting?: string; amazon?: string } = {}

  // The Amazon-only stage was handed a collecting sheet; re-emitting it would
  // just hand back the user's own file.
  if (params.stage !== 'amazon') {
    paths.collecting = `${job.id}/collecting.xlsx`
    const rows = outputs.map((o) => o.collecting).filter(Boolean)
    await uploadBuffer(OUTPUT_BUCKET, paths.collecting, buildCollectingSheet(rows), XLSX_MIME)
  }

  if (params.stage !== 'collecting' && params.templatePath) {
    const template = await loadTemplate(params.templatePath)
    const aoa = outputs.map((o) => o.amazon).filter((r): r is string[] => Array.isArray(r))
    const { buf, ext } = writeIntoTemplate(
      await downloadBuffer(INPUT_BUCKET, params.templatePath),
      template.sheetName,
      template.firstDataRow,
      aoa,
    )
    paths.amazon = `${job.id}/amazon-${template.productType || 'listings'}.${ext}`
    await uploadBuffer(OUTPUT_BUCKET, paths.amazon, buf, ext === 'xlsm' ? XLSM_MIME : XLSX_MIME)
  }

  return { primary: paths.amazon ?? paths.collecting, paths }
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

  const listing = j.type === 'listing'
  const listingParams = j.params as unknown as ListingJobParams

  // Listing rows are one or two text calls each, so a batch of them fits
  // comfortably inside maxDuration and a 1000-row job costs ~25 requests
  // instead of 1000. Images stay one per call: they are far slower and each
  // one holds a multi-megabyte buffer.
  const chunk = listing ? 40 : 1
  const concurrency = listing ? 8 : 1

  const { data: queued } = await supabase
    .from('automation_items')
    .select('*')
    .eq('job_id', jobId)
    .eq('status', 'queued')
    .order('position')
    .limit(chunk)

  const clean = (j.params as { mode?: string }).mode === 'clean'
  const template =
    listing && listingParams.stage !== 'collecting' && listingParams.templatePath
      ? await loadTemplate(listingParams.templatePath)
      : null

  await pool((queued as AutomationItem[]) ?? [], concurrency, async (item) => {
    await supabase.from('automation_items').update({ status: 'processing' }).eq('id', item.id)
    const usage: AiUsage[] = []
    try {
      const output = listing
        ? await processListingItem(item, listingParams, template, usage)
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
  })

  // Recompute progress.
  const { data: all } = await supabase.from('automation_items').select('status').eq('job_id', jobId)
  const statuses = (all as { status: string }[]) ?? []
  const done = statuses.filter((s) => s.status === 'done').length
  const failed = statuses.filter((s) => s.status === 'failed').length
  const remaining = statuses.length - done - failed

  const patch: Record<string, unknown> = { done_count: done, failed_count: failed }
  if (remaining === 0) {
    try {
      if (listing) {
        const { primary, paths } = await finalizeListing(j, supabase)
        patch.output_path = primary
        patch.params = { ...listingParams, outputs: paths }
      } else {
        patch.output_path = await finalizeImages(j, supabase)
      }
      patch.status = failed === statuses.length ? 'failed' : 'done'
    } catch (e) {
      patch.status = 'failed'
      patch.error = e instanceof Error ? e.message : 'Finalization failed'
    }
  }
  await supabase.from('automation_jobs').update(patch).eq('id', jobId)

  return NextResponse.json({ done, failed, total: statuses.length, remaining })
}
