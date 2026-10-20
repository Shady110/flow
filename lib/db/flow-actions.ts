'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/session'
import { ACCOUNT_STATUSES, CLIENT_STAGES, MARKETPLACES, PLATFORM_STAGES } from '@/lib/constants'
import type { ActionResult } from '@/lib/db/client-actions'

// Stage rules (who may move what, gates) are enforced by DB triggers (0013);
// these actions just surface the trigger's message. Updates to client_platforms
// deliberately avoid .select() — the row may leave the caller's view once moved.

function refresh(clientId?: string) {
  revalidatePath('/pipeline')
  revalidatePath('/clients')
  if (clientId) revalidatePath(`/clients/${clientId}`)
}

const platformStageSchema = z.object({
  platformId: z.string().uuid(),
  stage: z.enum(PLATFORM_STAGES as [string, ...string[]]),
})

export async function movePlatformStageAction(input: unknown): Promise<ActionResult> {
  const parsed = platformStageSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const supabase = await createClient()
  const { error } = await supabase
    .from('client_platforms')
    .update({ stage: parsed.data.stage })
    .eq('id', parsed.data.platformId)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/pipeline')
  revalidatePath('/clients', 'layout')
  revalidatePath('/content')
  revalidatePath('/accounts')
  return { ok: true }
}

const clientStageSchema = z.object({
  clientId: z.string().uuid(),
  stage: z.enum(CLIENT_STAGES as [string, ...string[]]),
})

export async function moveClientStageAction(input: unknown): Promise<ActionResult> {
  const parsed = clientStageSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const supabase = await createClient()
  const { error } = await supabase
    .from('clients')
    .update({ stage: parsed.data.stage })
    .eq('id', parsed.data.clientId)
  if (error) return { ok: false, error: error.message }
  refresh(parsed.data.clientId)
  return { ok: true }
}

const flowSchema = z.object({
  clientId: z.string().uuid(),
  budget: z.number().min(0).nullable(),
  estimated_cost: z.number().min(0).nullable(),
  target_live_date: z.string().nullable(),
})

export async function updateClientFlowAction(input: unknown): Promise<ActionResult> {
  await requirePermission('pipeline.manage')
  const parsed = flowSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const { clientId, ...fields } = parsed.data
  const supabase = await createClient()
  const { error } = await supabase.from('clients').update(fields).eq('id', clientId)
  if (error) return { ok: false, error: error.message }
  refresh(clientId)
  return { ok: true }
}

const addPlatformSchema = z.object({
  clientId: z.string().uuid(),
  platform: z.enum(MARKETPLACES as [string, ...string[]]),
})

export async function addPlatformAction(input: unknown): Promise<ActionResult> {
  await requirePermission('pipeline.manage')
  const parsed = addPlatformSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const supabase = await createClient()
  const { error } = await supabase
    .from('client_platforms')
    .insert({ client_id: parsed.data.clientId, platform: parsed.data.platform })
  if (error) {
    return {
      ok: false,
      error: error.code === '23505' ? 'That platform is already added.' : error.message,
    }
  }
  refresh(parsed.data.clientId)
  return { ok: true }
}

export async function removePlatformAction(platformId: string, clientId: string): Promise<ActionResult> {
  await requirePermission('pipeline.manage')
  const supabase = await createClient()
  const { error } = await supabase.from('client_platforms').delete().eq('id', platformId)
  if (error) return { ok: false, error: error.message }
  refresh(clientId)
  return { ok: true }
}

const platformSetupSchema = z.object({
  platformId: z.string().uuid(),
  clientId: z.string().uuid(),
  /** Which stages apply to this account. Must contain at least one. */
  stages: z.array(z.enum(PLATFORM_STAGES as [string, ...string[]])).min(1, 'Pick at least one stage'),
  account_manager_id: z.string().uuid().nullable(),
})

export async function updatePlatformSetupAction(input: unknown): Promise<ActionResult> {
  await requirePermission('pipeline.manage')
  const parsed = platformSetupSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const { platformId, clientId, stages, account_manager_id } = parsed.data
  // Keep flow order whatever order the UI sent.
  const ordered = PLATFORM_STAGES.filter((s) => stages.includes(s))

  const supabase = await createClient()
  const { data: current } = await supabase
    .from('client_platforms')
    .select('stage')
    .eq('id', platformId)
    .maybeSingle()
  if (current && !ordered.includes(current.stage)) {
    return { ok: false, error: 'Move the account out of that stage before removing it.' }
  }

  const { error } = await supabase
    .from('client_platforms')
    .update({ stages: ordered, account_manager_id })
    .eq('id', platformId)
  if (error) return { ok: false, error: error.message }
  refresh(clientId)
  return { ok: true }
}

const accountSchema = z.object({
  platformId: z.string().uuid(),
  clientId: z.string().uuid(),
  account_status: z.enum(ACCOUNT_STATUSES as [string, ...string[]]),
  store_name: z.string().nullable(),
  status_note: z.string().nullable(),
})

/** Account health, edited by the account manager (later filled by SP-API). */
export async function updateAccountStatusAction(input: unknown): Promise<ActionResult> {
  const parsed = accountSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const { platformId, clientId, ...fields } = parsed.data
  const supabase = await createClient()
  const { error } = await supabase
    .from('client_platforms')
    .update({ ...fields, checked_at: new Date().toISOString() })
    .eq('id', platformId)
  if (error) return { ok: false, error: error.message }
  refresh(clientId)
  revalidatePath('/accounts')
  return { ok: true }
}

const companySchema = z.object({
  cap: z.number().int('Enter a whole number between 0 and 1000.').min(0, 'Enter a whole number between 0 and 1000.').max(1000, 'Enter a whole number between 0 and 1000.'),
  whatsapp: z.string().trim().max(40),
  paymentEn: z.string().trim().max(2000),
  paymentAr: z.string().trim().max(2000),
})

/** Company-wide settings in one save: monthly client limit, support WhatsApp number, and the how-to-pay text clients see. */
export async function saveCompanySettingsAction(input: unknown): Promise<ActionResult> {
  const user = await requirePermission('settings.company')
  const parsed = companySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const { cap, whatsapp, paymentEn, paymentAr } = parsed.data

  const now = new Date().toISOString()
  const row = (key: string, value: unknown) => ({ key, value, updated_by: user.id, updated_at: now })
  const supabase = await createClient()
  const { error } = await supabase.from('app_settings').upsert([
    row('monthly_client_cap', cap),
    row('support_whatsapp', whatsapp),
    row('payment_instructions', { en: paymentEn, ar: paymentAr }),
  ])
  if (error) return { ok: false, error: error.message }
  revalidatePath('/settings/company')
  revalidatePath('/leads')
  return { ok: true }
}
