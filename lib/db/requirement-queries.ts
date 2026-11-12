import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { ClientRequirement, RequirementTemplate, RequirementKind } from '@/lib/types'

export async function getTemplates(): Promise<RequirementTemplate[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('requirement_templates')
    .select('*, items:requirement_template_items(*)')
    .order('created_at')
  return ((data as RequirementTemplate[]) ?? []).map((t) => ({
    ...t,
    items: [...(t.items ?? [])].sort((a, b) => a.position - b.position),
  }))
}

/** Requirements visible to the viewer (RLS: documents vs deliverables). */
export async function getRequirements(
  clientId: string,
  opts?: { kind?: RequirementKind; platformId?: string },
): Promise<ClientRequirement[]> {
  const supabase = await createClient()
  let q = supabase
    .from('client_requirements')
    .select('*')
    .eq('client_id', clientId)
    .order('position')
    .order('created_at')
  if (opts?.kind) q = q.eq('kind', opts.kind)
  if (opts?.platformId) q = q.eq('platform_id', opts.platformId)
  const { data } = await q
  return (data as ClientRequirement[]) ?? []
}

export interface DeliverableProgress {
  /** Required deliverables not yet submitted / approved / waived. */
  missing: number
  /** Required deliverables in total. */
  required: number
  /** Every deliverable, required or not. */
  total: number
}

/** Per-platform deliverable progress for the content queue. */
export async function getDeliverableProgress(
  platformIds: string[],
): Promise<Map<string, DeliverableProgress>> {
  const out = new Map<string, DeliverableProgress>()
  if (platformIds.length === 0) return out
  const supabase = await createClient()
  const { data } = await supabase
    .from('client_requirements')
    .select('platform_id, required, status')
    .eq('kind', 'content_deliverable')
    .in('platform_id', platformIds)
  for (const r of data ?? []) {
    const p = out.get(r.platform_id) ?? { missing: 0, required: 0, total: 0 }
    p.total += 1
    if (r.required) {
      p.required += 1
      if (!['submitted', 'approved', 'waived'].includes(r.status)) p.missing += 1
    }
    out.set(r.platform_id, p)
  }
  return out
}
