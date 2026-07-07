import { NextResponse, type NextRequest } from 'next/server'
import sharp from 'sharp'
import JSZip from 'jszip'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { downloadBuffer, uploadBuffer, INPUT_BUCKET, OUTPUT_BUCKET } from '@/lib/storage'
import { processListingRow } from '@/lib/automation/listing'
import { buildWorkbook } from '@/lib/automation/xlsx'
import { generateProductImage, type RefImage } from '@/lib/ai/gemini'
import { getMarketplace } from '@/lib/automation/marketplaces'
import type { AutomationItem, AutomationJob } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

const ANGLES = ['front', 'side', 'back'] as const

function mimeFromPath(p: string) {
  const ext = p.split('.').pop()?.toLowerCase()
  return ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
}

async function processImageItem(jobId: string, item: AutomationItem) {
  const input = item.input as { sku: string; images: string[] }
  const refs: RefImage[] = await Promise.all(
    input.images.map(async (p) => ({
      mimeType: mimeFromPath(p),
      base64: (await downloadBuffer(INPUT_BUCKET, p)).toString('base64'),
    })),
  )

  const images: Record<string, string> = {}
  for (const angle of ANGLES) {
    const raw = await generateProductImage(refs, angle)
    const jpg = await sharp(raw)
      .flatten({ background: '#ffffff' })
      .resize(2000, 2000, { fit: 'contain', background: '#ffffff' })
      .jpeg({ quality: 90 })
      .toBuffer()
    const outPath = `${jobId}/${input.sku}_${angle}.jpg`
    await uploadBuffer(OUTPUT_BUCKET, outPath, jpg, 'image/jpeg')
    images[angle] = outPath
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
      zip.file(`${it.output.sku}_${angle}.jpg`, buf)
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

  // Claim a small chunk of queued items (1 image product / 3 listing rows per call).
  const chunk = j.type === 'image' ? 1 : 3
  const { data: queued } = await supabase
    .from('automation_items')
    .select('*')
    .eq('job_id', jobId)
    .eq('status', 'queued')
    .order('position')
    .limit(chunk)

  for (const item of (queued as AutomationItem[]) ?? []) {
    await supabase.from('automation_items').update({ status: 'processing' }).eq('id', item.id)
    try {
      const output =
        j.type === 'listing'
          ? await processListingRow(
              (item.input as { canonical: Record<string, string> }).canonical,
              j.marketplace ?? '',
            )
          : await processImageItem(jobId, item)
      await supabase.from('automation_items').update({ status: 'done', output }).eq('id', item.id)
    } catch (e) {
      await supabase
        .from('automation_items')
        .update({ status: 'failed', error: e instanceof Error ? e.message : 'Failed' })
        .eq('id', item.id)
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
