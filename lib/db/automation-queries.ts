import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { AutomationJob, AutomationItem } from '@/lib/types'

export async function getJobs(): Promise<AutomationJob[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('automation_jobs')
    .select('*')
    .order('created_at', { ascending: false })
  return (data as AutomationJob[]) ?? []
}

export async function getJob(id: string): Promise<AutomationJob | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('automation_jobs').select('*').eq('id', id).maybeSingle()
  return (data as AutomationJob) ?? null
}

export interface JobCost {
  calls: number
  images: number
  usd: number
  egp: number
}

const EMPTY_COST: JobCost = { calls: 0, images: 0, usd: 0, egp: 0 }

/**
 * AI cost per job, keyed by job id. Reads the ai_usage_by_job rollup view.
 *
 * Returns an empty map if the ledger table isn't there yet — migration 0010 is
 * applied by hand, so the automations pages must not break before it lands.
 */
export async function getJobCosts(): Promise<Map<string, JobCost>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('ai_usage_by_job').select('*')
    if (error || !data) return new Map()
    return new Map(
      (data as { job_id: string; calls: number; images: number; cost_usd: number; cost_egp: number }[]).map(
        (r) => [r.job_id, { calls: Number(r.calls), images: Number(r.images), usd: Number(r.cost_usd), egp: Number(r.cost_egp) }],
      ),
    )
  } catch {
    return new Map()
  }
}

/**
 * Spend this calendar month and all time.
 *
 * ponytail: pulls every ledger row and buckets in JS — one row per API call, so
 * fine for now. If this grows past tens of thousands, add a monthly rollup view
 * next to ai_usage_by_job rather than paginating here.
 */
export async function getUsageTotals(): Promise<{ month: JobCost; allTime: JobCost }> {
  try {
    const supabase = await createClient()
    // job_id is null marks a website-chatbot call (app/api/chat). This figure
    // is shown on the Automations page, so chat spend must not inflate it —
    // query `job_id is null` if you want the chatbot's own spend.
    const { data, error } = await supabase
      .from('ai_usage')
      .select('cost_usd, fx_rate, images, created_at')
      .not('job_id', 'is', null)
    if (error || !data) return { month: EMPTY_COST, allTime: EMPTY_COST }

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const totals = { month: { ...EMPTY_COST }, allTime: { ...EMPTY_COST } }

    for (const r of data as { cost_usd: number; fx_rate: number; images: number; created_at: string }[]) {
      const usd = Number(r.cost_usd)
      const add = (t: JobCost) => {
        t.calls += 1
        t.images += Number(r.images)
        t.usd += usd
        t.egp += usd * Number(r.fx_rate)
      }
      add(totals.allTime)
      if (new Date(r.created_at) >= monthStart) add(totals.month)
    }
    return totals
  } catch {
    return { month: EMPTY_COST, allTime: EMPTY_COST }
  }
}

export async function getJobItems(jobId: string): Promise<AutomationItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('automation_items')
    .select('*')
    .eq('job_id', jobId)
    .order('position', { ascending: true })
  return (data as AutomationItem[]) ?? []
}
