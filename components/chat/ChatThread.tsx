'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/browser'
import { sendMessageAction } from '@/lib/db/chat-actions'
import { formatDate, formatTime } from '@/lib/format'
import type { Message } from '@/lib/types'
import { Button } from '@/components/ds/button'
import { cn } from '@/lib/utils'

interface ChatThreadProps {
  conversationId: string
  initialMessages: Message[]
  /** Which side "I" am, to align bubbles. */
  mySide: 'admin' | 'client'
  /** What to call the other side above their first message (defaults to "FLOW team" / "Client"). */
  theirName?: string
}

/**
 * One conversation, shared by the client portal and the team inbox. Bubbles use
 * logical corners so the tail sits on the right side in Arabic too, the box grows
 * for longer messages, and a failed send says so instead of silently restoring.
 */
export function ChatThread({ conversationId, initialMessages, mySide, theirName }: ChatThreadProps) {
  const t = useTranslations('chat')
  const locale = useLocale()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Realtime subscription for new messages in this conversation.
  // The socket must carry the user's JWT or RLS silently drops every event,
  // so we set the realtime auth token before subscribing.
  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null
    let cancelled = false

    ;(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled) return
      if (session?.access_token) supabase.realtime.setAuth(session.access_token)

      channel = supabase
        .channel(`conv:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const msg = payload.new as Message
            setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
          },
        )
        .subscribe()
    })()

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = body.trim()
    if (!text || sending) return
    setSending(true)
    setBody('')
    const res = await sendMessageAction({ conversationId, body: text })
    setSending(false)
    if (!res.ok) {
      setBody(text) // keep what they typed
      toast.error(t('sendFailed'))
      return
    }
    // Echo instantly (dedup against the realtime event that follows).
    const msg = res.message
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
  }

  const other = theirName ?? (mySide === 'client' ? t('team') : t('client'))
  const dayOf = (iso: string) => iso.slice(0, 10)

  return (
    <div className="flex h-full flex-col bg-muted/20">
      <div className="flex-1 overflow-y-auto" aria-live="polite">
        <div className="mx-auto flex w-full max-w-2xl flex-col px-3 py-5 sm:px-4">
          {messages.length === 0 && (
            <p className="py-16 text-center text-base text-muted-foreground">{t('empty')}</p>
          )}
          {messages.map((m, i) => {
            const mine = m.sender_type === mySide
            const prev = messages[i - 1]
            const grouped = prev && prev.sender_type === m.sender_type && dayOf(prev.created_at) === dayOf(m.created_at)
            const newDay = !prev || dayOf(prev.created_at) !== dayOf(m.created_at)
            return (
              <div key={m.id}>
                {newDay && (
                  <p className="my-4 text-center text-xs font-medium text-muted-foreground">{formatDate(m.created_at, locale)}</p>
                )}
                {!mine && !grouped && <p className="mb-1 mt-3 px-1 text-xs font-medium text-muted-foreground">{other}</p>}
                <div className={cn('flex w-full', mine ? 'justify-end' : 'justify-start', grouped ? 'mt-1' : 'mt-1.5')}>
                  <div
                    className={cn(
                      'flex max-w-[85%] items-end gap-2.5 rounded-2xl px-4 py-2.5 shadow-xs',
                      mine
                        ? 'rounded-ee-sm bg-primary text-primary-foreground'
                        : 'rounded-es-sm border border-border bg-card text-foreground',
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words text-base leading-relaxed">{m.body}</p>
                    <span className={cn('shrink-0 translate-y-0.5 text-[10px] tabular-nums', mine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                      {formatTime(m.created_at, locale)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void send()
          }}
          className="mx-auto flex w-full max-w-2xl items-end gap-2 px-3 py-3 sm:px-4"
        >
          <textarea
            value={body}
            rows={1}
            enterKeyHint="send"
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send()
              }
            }}
            placeholder={t('placeholder')}
            aria-label={t('placeholder')}
            className="max-h-32 min-h-12 min-w-0 flex-1 resize-none rounded-3xl border border-input bg-muted/30 px-4 py-3 text-base outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring [field-sizing:content]"
          />
          <Button
            type="submit"
            size="icon"
            aria-label={t('send')}
            className="h-12 w-12 shrink-0 rounded-full"
            disabled={sending || !body.trim()}
          >
            <Send className="h-5 w-5 rtl:-scale-x-100" />
          </Button>
        </form>
      </div>
    </div>
  )
}
