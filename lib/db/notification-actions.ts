'use server'

import { createClient } from '@/lib/supabase/server'

export interface NotificationItem {
  id: string
  audience: 'staff' | 'client'
  kind: string
  href: string | null
  payload: Record<string, string | number | null>
  read_at: string | null
  created_at: string
  /** Who it is about; shown to staff, who see every client. */
  client_name: string | null
}

/**
 * The signed-in person's latest notifications. Row-level security decides whose they are
 * (staff see the team's, a client sees their own), so there is no audience argument.
 */
export async function listNotificationsAction(): Promise<{ items: NotificationItem[]; unread: number }> {
  const supabase = await createClient()
  const [{ data }, { count }] = await Promise.all([
    supabase
      .from('notifications')
      .select('id, audience, kind, href, payload, read_at, created_at, clients(name)')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).is('read_at', null),
  ])
  const items = (data ?? []).map((r) => {
    const c = r.clients as { name: string } | { name: string }[] | null
    return {
      id: r.id,
      audience: r.audience,
      kind: r.kind,
      href: r.href,
      payload: (r.payload ?? {}) as NotificationItem['payload'],
      read_at: r.read_at,
      created_at: r.created_at,
      client_name: (Array.isArray(c) ? c[0]?.name : c?.name) ?? null,
    } as NotificationItem
  })
  return { items, unread: count ?? 0 }
}

/** Mark some (or, with no ids, all) of the viewer's notifications as read. */
export async function markNotificationsReadAction(ids?: string[]): Promise<void> {
  const supabase = await createClient()
  let q = supabase.from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null)
  if (ids?.length) q = q.in('id', ids)
  await q
}
