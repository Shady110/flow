'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { Message } from '@/lib/types'

/**
 * Get (or create) the conversation for a given client user. Used by the admin
 * inbox to open a thread with a specific client contact.
 */
export async function getOrCreateConversationForClientUser(
  clientUserId: string,
  clientId: string,
): Promise<{ ok: true; conversationId: string } | { ok: false; error: string }> {
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('client_user_id', clientUserId)
    .maybeSingle()
  if (existing) return { ok: true, conversationId: existing.id }

  const { data, error } = await supabase
    .from('conversations')
    .insert({ client_user_id: clientUserId, client_id: clientId, subject: 'General' })
    .select('id')
    .single()
  if (error) return { ok: false, error: error.message }
  return { ok: true, conversationId: data.id }
}

/** Get (or create) the current client user's own conversation (portal side). */
export async function getOrCreateMyConversation(): Promise<
  { ok: true; conversationId: string } | { ok: false; error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  const { data: cu } = await supabase
    .from('client_users')
    .select('id, client_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!cu) return { ok: false, error: 'No client profile.' }

  return getOrCreateConversationForClientUser(cu.id, cu.client_id)
}

const sendSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().min(1).max(4000),
})

export type SendMessageResult =
  | { ok: true; message: Message }
  | { ok: false; error: string }

/**
 * Send a message. The sender identity (admin vs client) is derived from the
 * session; RLS enforces that the sender is a participant. Returns the inserted
 * row so the UI can echo it instantly (realtime handles the other participant).
 */
export async function sendMessageAction(input: unknown): Promise<SendMessageResult> {
  const parsed = sendSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Message is empty.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  // Determine whether the sender is an internal admin or a client user.
  const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()

  let payload: Record<string, unknown>
  if (profile) {
    payload = {
      conversation_id: parsed.data.conversationId,
      sender_type: 'admin',
      sender_profile_id: user.id,
      body: parsed.data.body,
    }
  } else {
    const { data: cu } = await supabase
      .from('client_users')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!cu) return { ok: false, error: 'Not a participant.' }
    payload = {
      conversation_id: parsed.data.conversationId,
      sender_type: 'client',
      sender_client_user_id: cu.id,
      body: parsed.data.body,
    }
  }

  const { data: message, error } = await supabase.from('messages').insert(payload).select('*').single()
  if (error) return { ok: false, error: error.message }

  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', parsed.data.conversationId)

  return { ok: true, message: message as Message }
}
