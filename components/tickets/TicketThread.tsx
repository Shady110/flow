'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Send } from 'lucide-react'
import { replyTicketAction } from '@/lib/db/ticket-actions'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ds/button'
import { Textarea } from '@/components/ds/textarea'
import type { TicketMessage } from '@/lib/types'

/**
 * The conversation on one ticket. `viewer` decides which side "I" am and how the
 * other side is named: staff see teammates' names and "Client"; clients see
 * "FLOW team" — they can't read staff profiles.
 */
export function TicketThread({
  ticketId,
  messages,
  viewer,
  staffNames,
  clientLabel,
  closed,
}: {
  ticketId: string
  messages: TicketMessage[]
  viewer: 'staff' | 'client'
  staffNames: Record<string, string>
  clientLabel: string
  closed: boolean
}) {
  const router = useRouter()
  const t = useTranslations('internal.tickets')
  const [body, setBody] = useState('')
  const [pending, startTransition] = useTransition()

  const author = (m: TicketMessage) =>
    m.sender_type === 'client'
      ? viewer === 'client' ? t('you') : clientLabel
      : viewer === 'client' ? t('team') : (m.sender_profile_id && staffNames[m.sender_profile_id]) || t('team')

  return (
    <div className="space-y-4">
      {messages.length === 0 && <p className="text-sm text-muted-foreground">{t('noReplies')}</p>}
      <ul className="space-y-3">
        {messages.map((m) => {
          const mine = m.sender_type === (viewer === 'staff' ? 'staff' : 'client')
          return (
            <li key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[85%] rounded-2xl px-4 py-2.5 text-sm', mine ? 'bg-flow-green text-white' : 'bg-muted')}>
                <p className={cn('mb-0.5 text-xs font-medium', mine ? 'text-white/80' : 'text-muted-foreground')}>
                  {author(m)} · {new Date(m.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
                <p className="whitespace-pre-line">{m.body}</p>
              </div>
            </li>
          )
        })}
      </ul>

      {closed ? (
        <p className="text-sm text-muted-foreground">{t('closedNote')}</p>
      ) : (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            startTransition(async () => {
              const res = await replyTicketAction({ ticketId, body })
              if (!res.ok) return void toast.error(res.error)
              setBody('')
              router.refresh()
            })
          }}
        >
          <Textarea rows={3} value={body} placeholder={t('replyPlaceholder')} onChange={(e) => setBody(e.target.value)} />
          <Button type="submit" disabled={pending || !body.trim()}>
            <Send className="h-4 w-4 rtl:-scale-x-100" /> {t('send')}
          </Button>
        </form>
      )}
    </div>
  )
}
