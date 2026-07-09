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

export async function getJobItems(jobId: string): Promise<AutomationItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('automation_items')
    .select('*')
    .eq('job_id', jobId)
    .order('position', { ascending: true })
  return (data as AutomationItem[]) ?? []
}
