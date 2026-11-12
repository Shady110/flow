import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

/** What happened. The bell turns `kind` + `payload` into a translated sentence. */
export type NotificationKind =
  | 'stage_moved'
  | 'task_created'
  | 'task_updated'
  | 'invoice_issued'
  | 'payment_recorded'
  | 'contract_sent'
  | 'contract_accepted'
  | 'requirement_requested'
  | 'requirement_reviewed'
  | 'requirement_submitted'
  | 'ticket_created'
  | 'ticket_reply'
  | 'ticket_status'
  | 'message_received'
  | 'payment_received'
  | 'post_status'

interface NotifyInput {
  /** 'client' = tell the client what we did; 'staff' = tell the team what the client did. */
  audience: 'client' | 'staff'
  clientId: string
  kind: NotificationKind
  /** Where the bell sends the viewer on click (a path inside their own portal). */
  href?: string
  /** Small facts for the sentence: names, titles, numbers. */
  payload?: Record<string, string | number | null>
}

/**
 * Record a notification. Best-effort: a failure here must never break the action
 * that triggered it, so errors are logged and swallowed.
 */
export async function notify(n: NotifyInput): Promise<void> {
  try {
    const { error } = await createAdminClient().from('notifications').insert({
      audience: n.audience,
      client_id: n.clientId,
      kind: n.kind,
      href: n.href ?? null,
      payload: n.payload ?? {},
    })
    if (error) console.error('[notify]', error.message)
  } catch (e) {
    console.error('[notify]', e)
  }
}
