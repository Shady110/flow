'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createClientUserAction } from '@/lib/db/client-user-actions'
import { slugRe } from '@/lib/slug'
import type { ActionResult } from '@/lib/db/client-actions'
import { LEAD_STATUSES } from '@/lib/constants'
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
 * Turn a lead into a paying client: creates the client (their dashboard tenant),
 * carries the lead's contact block into the client notes, optionally provisions
 * the portal login, and marks the lead won. Returns the one-time portal password
 * when a login was created.
 */
export async function convertLeadAction(
  input: unknown,
): Promise<ActionResult & { clientId?: string; tempPassword?: string }> {
  const parsed = convertSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const { leadId, slug, name, contactEmail, contactName } = parsed.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).maybeSingle()
  if (!lead) return { ok: false, error: 'Lead not found.' }
  if (lead.converted_client_id) {
    return { ok: false, error: 'This lead was already converted to a client.' }
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

  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .insert({
      name,
      slug,
      status: 'active',
      notes: contactBlock || null,
      created_by: user?.id ?? null,
    })
    .select('id')
    .single()
  if (clientErr) {
    return {
      ok: false,
      error: clientErr.code === '23505' ? 'That subdomain is already taken.' : clientErr.message,
    }
  }

  // Portal login (optional — the client record alone is enough to start).
  let tempPassword: string | undefined
  if (contactEmail) {
    const res = await createClientUserAction({
      clientId: client.id,
      email: contactEmail,
      fullName: contactName || lead.name,
    })
    if (!res.ok) {
      // The client exists; surface the login failure without losing it.
      await supabase
        .from('leads')
        .update({ status: 'won', converted_client_id: client.id })
        .eq('id', leadId)
      revalidatePath('/leads')
      return {
        ok: false,
        error: `Client created, but the portal login failed: ${res.error}. Add the user from the client page.`,
      }
    }
    tempPassword = res.tempPassword
  }

  const { error: leadErr } = await supabase
    .from('leads')
    .update({ status: 'won', converted_client_id: client.id })
    .eq('id', leadId)
  if (leadErr) return { ok: false, error: leadErr.message }

  revalidatePath(`/leads/${leadId}`)
  revalidatePath('/leads')
  revalidatePath('/clients')
  revalidatePath('/')
  return { ok: true, clientId: client.id, tempPassword }
}
