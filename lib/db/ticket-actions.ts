'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { getClientContext } from '@/lib/auth/client-session'
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from '@/lib/tickets'
import type { ActionResult } from '@/lib/db/client-actions'

function refresh(ticketId?: string) {
  revalidatePath('/accounts', 'layout')
  revalidatePath('/tickets', 'layout')
  if (ticketId) revalidatePath(`/accounts/tickets/${ticketId}`)
}

const createSchema = z.object({
  platformId: z.string().uuid(),
  category: z.string().min(1),
  title: z.string().trim().min(3, 'Give the ticket a short title'),
  body: z.string().trim().optional().nullable(),
  priority: z.enum(TICKET_PRIORITIES as [string, ...string[]]).optional(),
})

/**
 * Open a ticket. From the portal it belongs to the signed-in client; from the
 * dashboard it is an "offline" ticket for a client who reached us another way.
 * The database checks the platform belongs to the client and (for clients) is live.
 */
export async function createTicketAction(
  input: unknown,
): Promise<ActionResult & { id?: string }> {
  const parsed = createSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const { platformId, category, title, body, priority } = parsed.data

  const supabase = await createClient()
  const { data: plat } = await supabase
    .from('client_platforms')
    .select('client_id, platform')
    .eq('id', platformId)
    .maybeSingle()
  if (!plat) return { ok: false, error: 'Account not found.' }
  const allowed = TICKET_CATEGORIES[plat.platform as keyof typeof TICKET_CATEGORIES] ?? []
  if (!allowed.includes(category)) return { ok: false, error: 'Pick a ticket type from the list.' }

  const row = {
    client_id: plat.client_id,
    platform_id: platformId,
    category,
    title,
    body: body || null,
    ...(priority ? { priority } : {}),
  }

  const staff = await getCurrentUser()
  let insert
  if (staff) {
    if (!staff.permissions.has('tickets.manage')) return { ok: false, error: 'You can\'t open tickets.' }
    insert = { ...row, source: 'offline', created_by_profile: staff.id }
  } else {
    const ctx = await getClientContext()
    if (!ctx || ctx.client.id !== plat.client_id) return { ok: false, error: 'Please sign in again.' }
    insert = { ...row, source: 'portal', created_by_client_user: ctx.clientUser.id }
  }

  const { data, error } = await supabase.from('tickets').insert(insert).select('id').single()
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not open the ticket.' }
  refresh()
  return { ok: true, id: data.id }
}

const replySchema = z.object({
  ticketId: z.string().uuid(),
  body: z.string().trim().min(1, 'Write a message first'),
})

export async function replyTicketAction(input: unknown): Promise<ActionResult> {
  const parsed = replySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const { ticketId, body } = parsed.data

  const supabase = await createClient()
  const staff = await getCurrentUser()
  const sender = staff
    ? { sender_type: 'staff', sender_profile_id: staff.id }
    : await (async () => {
        const ctx = await getClientContext()
        return ctx ? { sender_type: 'client', sender_client_user_id: ctx.clientUser.id } : null
      })()
  if (!sender) return { ok: false, error: 'Please sign in again.' }

  const { error } = await supabase.from('ticket_messages').insert({ ticket_id: ticketId, body, ...sender })
  if (error) return { ok: false, error: error.message }
  refresh(ticketId)
  revalidatePath(`/tickets/${ticketId}`)
  return { ok: true }
}

const updateSchema = z.object({
  ticketId: z.string().uuid(),
  status: z.enum(TICKET_STATUSES as [string, ...string[]]).optional(),
  priority: z.enum(TICKET_PRIORITIES as [string, ...string[]]).optional(),
  assignee_id: z.string().uuid().nullable().optional(),
})

/** Staff: change status, priority or who is handling it. */
export async function updateTicketAction(input: unknown): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const { ticketId, ...fields } = parsed.data
  const supabase = await createClient()
  const { error } = await supabase.from('tickets').update(fields).eq('id', ticketId)
  if (error) return { ok: false, error: error.message }
  refresh(ticketId)
  return { ok: true }
}
