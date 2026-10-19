'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/auth/session'
import { provisionClientUser } from '@/lib/db/client-user-provision'
import { parseDeal } from '@/lib/deals'
import { slugRe } from '@/lib/slug'
import type { ActionResult } from '@/lib/db/client-actions'
import { CONTACT_METHODS, LEAD_STATUSES, MARKETPLACES } from '@/lib/constants'
import type { LeadStatus } from '@/lib/types'

const leadSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  company: z.string().optional().nullable(),
  email: z.string().email('Enter a valid email').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  area: z.string().optional().nullable(),
  field: z.string().optional().nullable(),
  status: z.enum(LEAD_STATUSES as [LeadStatus, ...LeadStatus[]]),
  source: z.string().optional().nullable(),
  plan_interest: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  owner_id: z.string().uuid().optional().nullable(),
})

function clean<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj }
  for (const k of Object.keys(out)) {
    if (out[k] === '' || out[k] === undefined) (out as Record<string, unknown>)[k] = null
  }
  return out
}

export async function createLeadAction(input: unknown): Promise<ActionResult> {
  const parsed = leadSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('leads')
    .insert(clean({ ...parsed.data, created_by: user?.id ?? null }))
  if (error) return { ok: false, error: error.message }

  revalidatePath('/leads')
  revalidatePath('/')
  return { ok: true }
}

export async function updateLeadAction(id: string, input: unknown): Promise<ActionResult> {
  const parsed = leadSchema.partial().safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.from('leads').update(clean({ ...parsed.data })).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/leads/${id}`)
  revalidatePath('/leads')
  return { ok: true }
}

export async function deleteLeadAction(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/leads')
  revalidatePath('/')
  return { ok: true }
}

const contactSchema = z.object({
  leadId: z.string().uuid(),
  method: z.enum(CONTACT_METHODS as [string, ...string[]]),
  note: z.string().trim().optional().nullable(),
  /** Where the lead stands after this contact; omit to leave it unchanged. */
  status: z.enum(LEAD_STATUSES as [LeadStatus, ...LeadStatus[]]).optional().nullable(),
})

/**
 * Log a call / message / meeting. The status change goes first, so a refusal
 * (e.g. the monthly cap on "won") leaves no log entry claiming it happened.
 * A first contact with no explicit status moves a "new" lead to "contacted".
 */
export async function logContactAction(input: unknown): Promise<ActionResult> {
  const user = await requirePermission('leads.edit')
  const parsed = contactSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const { leadId, method, note } = parsed.data

  const supabase = await createClient()
  const { data: lead } = await supabase.from('leads').select('status').eq('id', leadId).maybeSingle()
  if (!lead) return { ok: false, error: 'Lead not found.' }

  const next: LeadStatus | null =
    parsed.data.status ?? (lead.status === 'new' ? 'contacted' : null)
  if (next && next !== lead.status) {
    const { error } = await supabase.from('leads').update({ status: next }).eq('id', leadId)
    if (error) return { ok: false, error: error.message }
  }

  const { error } = await supabase.from('lead_activities').insert({
    lead_id: leadId,
    method,
    note: note || null,
    status_after: next ?? lead.status,
    created_by: user.id,
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/leads/${leadId}`)
  revalidatePath('/leads')
  return { ok: true }
}

/** Save what the lead wants: marketplaces, contract length and package phases. */
export async function updateLeadDealAction(leadId: string, deal: unknown): Promise<ActionResult> {
  await requirePermission('leads.edit')
  const parsed = parseDeal(deal)
  if (!parsed) return { ok: false, error: 'Add at least one package phase with months and a monthly price.' }
  const platforms = parsed.platforms.filter((p) => (MARKETPLACES as string[]).includes(p))

  const supabase = await createClient()
  const { error } = await supabase
    .from('leads')
    .update({ deal: { ...parsed, platforms } })
    .eq('id', leadId)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/leads/${leadId}`)
  return { ok: true }
}

const convertSchema = z.object({
  leadId: z.string().uuid(),
  slug: z.string().min(2).regex(slugRe, 'Use lowercase letters, numbers and hyphens (subdomain-safe)'),
  /** Company name for the client record; defaults to the lead's company/name. */
  name: z.string().min(2, 'Client name is required'),
  /** Portal login. Omit to create the client without portal access for now. */
  contactEmail: z.string().email('Enter a valid email').optional().or(z.literal('')),
  contactName: z.string().optional(),
})

/**
 * Turn a lead into a client. Marking the lead won comes FIRST and goes through
 * the signed-in user, so the monthly cap (a database trigger) can refuse it
 * before anything is created. After that the client, its platform accounts and
 * the portal login are created with the admin client: Sales holds leads.convert
 * but not clients.create, and this action is the one place that grants it.
 * The new client starts at "group created"; the deal carries over.
 */
export async function convertLeadAction(
  input: unknown,
): Promise<ActionResult & { clientId?: string; tempPassword?: string }> {
  const user = await requirePermission('leads.convert')
  const parsed = convertSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const { leadId, slug, name, contactEmail, contactName } = parsed.data

  const supabase = await createClient()
  const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).maybeSingle()
  if (!lead) return { ok: false, error: 'Lead not found.' }
  if (lead.converted_client_id) {
    return { ok: false, error: 'This lead was already converted to a client.' }
  }

  // Cap check + won_at stamp (no-op if it was already won).
  if (lead.status !== 'won') {
    const { error } = await supabase.from('leads').update({ status: 'won' }).eq('id', leadId)
    if (error) return { ok: false, error: error.message }
  }

  const contactBlock = [
    lead.company ? `Company: ${lead.company}` : null,
    lead.email ? `Email: ${lead.email}` : null,
    lead.phone ? `Phone: ${lead.phone}` : null,
    lead.address ? `Address: ${lead.address}` : null,
    lead.area ? `Area: ${lead.area}` : null,
    lead.field ? `Field: ${lead.field}` : null,
    lead.plan_interest ? `Interested in: ${lead.plan_interest}` : null,
    lead.source ? `Source: ${lead.source}` : null,
    lead.notes ? `\nLead notes:\n${lead.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const deal = parseDeal(lead.deal)
  const admin = createAdminClient()
  const { data: client, error: clientErr } = await admin
    .from('clients')
    .insert({
      name,
      slug,
      status: 'active',
      notes: contactBlock || null,
      deal: deal ?? null,
      created_by: user.id,
    })
    .select('id')
    .single()
  if (clientErr) {
    return {
      ok: false,
      error: clientErr.code === '23505' ? 'That subdomain is already taken.' : clientErr.message,
    }
  }

  // One platform account per marketplace in the deal; the CEO tailors stages and managers later.
  const platforms = (deal?.platforms ?? []).filter((p) => (MARKETPLACES as string[]).includes(p))
  if (platforms.length) {
    await admin
      .from('client_platforms')
      .insert(platforms.map((platform) => ({ client_id: client.id, platform })))
  }

  await supabase.from('leads').update({ converted_client_id: client.id }).eq('id', leadId)

  // Portal login (optional — the client record alone is enough to start).
  let tempPassword: string | undefined
  if (contactEmail) {
    const res = await provisionClientUser(
      { clientId: client.id, email: contactEmail, fullName: contactName || lead.name },
      admin,
    )
    if (!res.ok) {
      revalidatePath('/leads')
      return {
        ok: false,
        error: `Client created, but the portal login failed: ${res.error}. Add the user from the client page.`,
      }
    }
    tempPassword = res.tempPassword
  }

  revalidatePath(`/leads/${leadId}`)
  revalidatePath('/leads')
  revalidatePath('/clients')
  revalidatePath('/pipeline')
  revalidatePath('/')
  return { ok: true, clientId: client.id, tempPassword }
}
