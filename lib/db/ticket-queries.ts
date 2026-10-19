import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { ACTIVE_TICKET_STATUSES } from '@/lib/tickets'
import type { Ticket, TicketMessage, TicketStatus } from '@/lib/types'

export interface TicketFilters {
  platformId?: string
  clientId?: string
  assigneeId?: string
  status?: TicketStatus | 'active'
}

/** Tickets the viewer can see (RLS: staff by account, clients their own), newest activity first. */
export async function getTickets(filters: TicketFilters = {}): Promise<Ticket[]> {
  const supabase = await createClient()
  let q = supabase.from('tickets').select('*').order('updated_at', { ascending: false })
  if (filters.platformId) q = q.eq('platform_id', filters.platformId)
  if (filters.clientId) q = q.eq('client_id', filters.clientId)
  if (filters.assigneeId) q = q.eq('assignee_id', filters.assigneeId)
  if (filters.status === 'active') q = q.in('status', ACTIVE_TICKET_STATUSES)
  else if (filters.status) q = q.eq('status', filters.status)
  const { data } = await q
  return (data as Ticket[]) ?? []
}

export async function getTicket(id: string): Promise<Ticket | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('tickets').select('*').eq('id', id).maybeSingle()
  return (data as Ticket) ?? null
}

export async function getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at')
  return (data as TicketMessage[]) ?? []
}
