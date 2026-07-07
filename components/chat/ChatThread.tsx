'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/browser'
import { sendMessageAction } from '@/lib/db/chat-actions'
import type { Message } from '@/lib/types'
import { Button } from '@/components/ds/button'
import { cn } from '@/lib/utils'

interface ChatThreadProps {
  conversationId: string
  initialMessages: Message[]
  /** Which side "I" am, to align bubbles. */
  mySide: 'admin' | 'client'
  accentClass?: string
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export function ChatThread({ conversationId, initialMessages, mySide, accentClass }: ChatThreadProps) {
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

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    setSending(true)
    setBody('')
    const res = await sendMessageAction({ conversationId, body: text })
    setSending(false)
    if (!res.ok) {
      setBody(text) // restore on failure
      return
    }
    // Echo instantly (dedup against the realtime event that follows).
    const msg = res.message
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
  }

  return (
    <div className="flex h-full flex-col bg-muted/20">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col px-4 py-6">
          {messages.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No messages yet. Say hello 👋
            </p>
          )}
          {messages.map((m, i) => {
            const mine = m.sender_type === mySide
            const prev = messages[i - 1]
            const grouped = prev && prev.sender_type === m.sender_type
            return (
              <div
                key={m.id}
                className={cn(
                  'flex w-full',
                  mine ? 'justify-end' : 'justify-start',
                  grouped ? 'mt-1' : 'mt-4',
                )}
              >
                <div
                  className={cn(
                    'flex max-w-[85%] items-end gap-2.5 rounded-2xl px-4 py-2.5 shadow-xs',
                    mine
                      ? cn('rounded-br-sm bg-flow-green text-flow-bg', accentClass)
                      : 'rounded-bl-sm border border-border bg-background text-foreground',
                  )}
                >
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.body}</p>
                  <span
                    className={cn(
                      'shrink-0 translate-y-0.5 text-[10px] tabular-nums',
                      mine ? 'text-flow-bg/60' : 'text-muted-foreground',
                    )}
                  >
                    {timeLabel(m.created_at)}
                  </span>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-border bg-background">
        <form onSubmit={send} className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type a message…"
            className="h-11 min-w-0 flex-1 rounded-full border border-input bg-muted/30 px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-full"
            disabled={sending || !body.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
