'use server'

import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/auth/session'
import { getClientContext } from '@/lib/auth/client-session'
import { leftoverPlaceholders } from '@/lib/contracts'
import { parseDeal } from '@/lib/deals'
import type { ActionResult } from '@/lib/db/client-actions'
import type { Contract } from '@/lib/types'

function refresh(clientId?: string) {
  revalidatePath('/contracts', 'layout')
  revalidatePath('/contract')
  revalidatePath('/pipeline')
  if (clientId) revalidatePath(`/clients/${clientId}`)
}

const sha256 = (text: string) => createHash('sha256').update(text, 'utf8').digest('hex')

// ── Templates ───────────────────────────────────────────────────────────────

const templateSchema = z.object({
  name: z.string().trim().min(2, 'Give the template a name'),
  locale: z.enum(['en', 'ar']),
  body: z.string().trim().min(20, 'The contract text is too short'),
})

export async function saveContractTemplateAction(id: string | null, input: unknown): Promise<ActionResult> {
  await requirePermission('contracts.manage')
  const parsed = templateSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const supabase = await createClient()
  const { error } = id
    ? await supabase.from('contract_templates').update(parsed.data).eq('id', id)
    : await supabase.from('contract_templates').insert(parsed.data)
  if (error) return { ok: false, error: error.message }
  refresh()
  return { ok: true }
}

export async function deleteContractTemplateAction(id: string): Promise<ActionResult> {
  await requirePermission('contracts.manage')
  const supabase = await createClient()
  const { error } = await supabase.from('contract_templates').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  refresh()
  return { ok: true }
}

// ── Contracts ───────────────────────────────────────────────────────────────

const contractSchema = z.object({
  clientId: z.string().uuid(),
  templateId: z.string().uuid().nullable(),
  title: z.string().trim().min(2, 'Give the contract a title'),
  locale: z.enum(['en', 'ar']),
  body: z.string().trim().min(20, 'The contract text is too short'),
  terms: z.unknown(),
  start_date: z.string().nullable(),
})

/** Create or update a DRAFT. The text is final, so it must have no unfilled placeholders. */
export async function saveContractAction(
  id: string | null,
  input: unknown,
): Promise<ActionResult & { id?: string }> {
  const user = await requirePermission('contracts.manage')
  const parsed = contractSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const { clientId, templateId, terms, ...rest } = parsed.data

  const deal = parseDeal(terms)
  if (!deal) return { ok: false, error: 'Add at least one package phase with months and a monthly price.' }
  const left = leftoverPlaceholders(rest.body)
  if (left.length) return { ok: false, error: `Fill or remove: ${left.map((k) => `{{${k}}}`).join(', ')}` }

  const row = { client_id: clientId, template_id: templateId, terms: deal, ...rest }
  const supabase = await createClient()
  if (id) {
    const { error } = await supabase.from('contracts').update(row).eq('id', id).eq('status', 'draft')
    if (error) return { ok: false, error: error.message }
    refresh(clientId)
    return { ok: true, id }
  }
  const { data, error } = await supabase
    .from('contracts')
    .insert({ ...row, created_by: user.id })
    .select('id')
    .single()
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not save the contract.' }
  refresh(clientId)
  return { ok: true, id: data.id }
}

async function loadContract(id: string): Promise<Contract | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('contracts').select('*').eq('id', id).maybeSingle()
  return (data as Contract) ?? null
}

/** Freeze the text (with its hash) and make it visible to the client. */
export async function sendContractAction(id: string): Promise<ActionResult> {
  await requirePermission('contracts.manage')
  const c = await loadContract(id)
  if (!c) return { ok: false, error: 'Contract not found.' }
  if (c.status !== 'draft') return { ok: false, error: 'Only a draft can be sent.' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('contracts')
    .update({ status: 'sent', sent_at: new Date().toISOString(), body_sha256: sha256(c.body) })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }
  refresh(c.client_id)
  return { ok: true }
}

export async function voidContractAction(id: string): Promise<ActionResult> {
  await requirePermission('contracts.manage')
  const c = await loadContract(id)
  if (!c) return { ok: false, error: 'Contract not found.' }
  if (c.status === 'accepted') return { ok: false, error: 'An accepted contract can\'t be voided here.' }
  const supabase = await createClient()
  const { error } = await supabase.from('contracts').update({ status: 'void' }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  refresh(c.client_id)
  return { ok: true }
}

export async function deleteContractAction(id: string): Promise<ActionResult> {
  await requirePermission('contracts.manage')
  const c = await loadContract(id)
  if (!c) return { ok: false, error: 'Contract not found.' }
  if (c.status !== 'draft') return { ok: false, error: 'Only drafts can be deleted — void it instead.' }
  const supabase = await createClient()
  const { error } = await supabase.from('contracts').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  refresh(c.client_id)
  return { ok: true }
}

/** The client signed on paper / over WhatsApp. Recorded as offline, with who marked it. */
export async function markAcceptedOfflineAction(id: string, signerName: string): Promise<ActionResult> {
  await requirePermission('contracts.manage')
  const name = signerName.trim()
  if (name.length < 2) return { ok: false, error: 'Enter the name of the person who signed.' }
  const c = await loadContract(id)
  if (!c) return { ok: false, error: 'Contract not found.' }
  if (c.status !== 'draft' && c.status !== 'sent') return { ok: false, error: 'This contract can\'t be accepted any more.' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('contracts')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      accepted_name: name,
      accepted_offline: true,
      sent_at: c.sent_at ?? new Date().toISOString(),
      body_sha256: c.body_sha256 ?? sha256(c.body),
    })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }
  refresh(c.client_id)
  return { ok: true }
}

const acceptSchema = z.object({
  contractId: z.string().uuid(),
  name: z.string().trim().min(2, 'Type your full name to sign'),
  agree: z.literal(true, { error: 'Tick the box to confirm you agree' }),
})

/**
 * The client accepts in the portal. Written with the service role so the IP and
 * user agent come from the request, not from anything the browser can send.
 */
export async function acceptContractAction(input: unknown): Promise<ActionResult> {
  const parsed = acceptSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const ctx = await getClientContext()
  if (!ctx) return { ok: false, error: 'Please sign in again.' }

  const c = await loadContract(parsed.data.contractId) // RLS: only their own sent/accepted
  if (!c || c.client_id !== ctx.client.id) return { ok: false, error: 'Contract not found.' }
  if (c.status !== 'sent') return { ok: false, error: 'This contract is not waiting for your signature.' }
  if (!c.body_sha256 || sha256(c.body) !== c.body_sha256) {
    return { ok: false, error: 'This contract changed after it was sent. Please contact us.' }
  }

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? null
  const admin = createAdminClient()
  const { error } = await admin
    .from('contracts')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      accepted_name: parsed.data.name,
      accepted_ip: ip,
      accepted_ua: h.get('user-agent')?.slice(0, 300) ?? null,
      accepted_by: ctx.clientUser.id,
    })
    .eq('id', c.id)
    .eq('status', 'sent')
  if (error) return { ok: false, error: error.message }

  // What was signed is now what we bill against (read by billing in Phase H).
  if (c.terms) await admin.from('clients').update({ deal: c.terms }).eq('id', c.client_id)
  refresh(c.client_id)
  return { ok: true }
}
