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
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel)
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
    if (!res.ok) setBody(text) // restore on failure
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No messages yet. Say hello 👋
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_type === mySide
          return (
            <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                  mine
                    ? cn('rounded-br-sm bg-flow-green text-flow-bg', accentClass)
                    : 'rounded-bl-sm bg-muted text-foreground',
                )}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={cn('mt-1 text-[10px]', mine ? 'text-flow-bg/60' : 'text-muted-foreground')}>
                  {timeLabel(m.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" size="icon" className="rounded-full" disabled={sending || !body.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
