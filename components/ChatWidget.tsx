'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X, Send, Check } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

/**
 * The public website chatbot. Grounded in the company handbook + the live rate
 * card server-side (see lib/ai/knowledge.ts) — this component only moves text.
 *
 * The conversation deliberately lives in React state and nowhere else. There is
 * no transcript table: a conversation that matters ends in a lead, and the
 * transcript is saved on that lead. Add storage when you want to read the
 * conversations that did NOT convert.
 */

interface Msg {
  role: 'user' | 'model'
  content: string
}

const MAX_CHARS = 1000

export default function ChatWidget() {
  const t = useTranslations('marketing.chat')
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captured, setCaptured] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, pending])

  // Escape closes the panel, as any dialog should.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function send(text: string) {
    const content = text.trim().slice(0, MAX_CHARS)
    if (!content || pending) return

    const next: Msg[] = [...messages, { role: 'user', content }]
    setMessages(next)
    setDraft('')
    setError(null)
    setPending(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, locale }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.reply) {
        setError(res.status === 429 ? t('rateLimited') : t('error'))
        return
      }
      setMessages([...next, { role: 'model', content: data.reply }])
      if (data.leadCaptured) setCaptured(true)
    } catch {
      setError(t('error'))
    } finally {
      setPending(false)
    }
  }

  const quickReplies = [t('quickPricing'), t('quickPackage'), t('quickHuman')]

  return (
    <>
      {/* Launcher — `end-5` is logical, so it sits bottom-left under RTL. */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t('close') : t('open')}
        aria-expanded={open}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 end-5 z-50 grid h-14 w-14 place-items-center rounded-full
                   bg-flow-green text-flow-lime shadow-xl shadow-flow-green/25
                   transition-colors hover:bg-flow-green-hover
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-lime
                   focus-visible:ring-offset-2"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={t('title')}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 end-5 z-50 flex w-[min(24rem,calc(100vw-2.5rem))]
                       h-[min(34rem,calc(100vh-9rem))] flex-col overflow-hidden rounded-3xl
                       border border-flow-border bg-flow-bg shadow-2xl shadow-flow-green/20"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-flow-border bg-flow-green px-4 py-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-flow-lime text-flow-green">
                <MessageCircle className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold text-flow-bg">{t('title')}</p>
                <p className="truncate text-xs text-flow-lime-soft/80">{t('subtitle')}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('close')}
                className="rounded-full p-1.5 text-flow-bg/70 transition-colors hover:bg-white/10 hover:text-flow-bg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4" aria-live="polite">
              <Bubble role="model">{t('greeting')}</Bubble>

              {messages.map((m, i) => (
                <Bubble key={i} role={m.role}>
                  {m.content}
                </Bubble>
              ))}

              {pending && (
                <div className="flex w-fit gap-1 rounded-2xl rounded-es-md border border-flow-border bg-white px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-flow-text-muted"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              )}

              {captured && (
                <div className="flex items-center gap-2 self-center rounded-full bg-flow-lime/40 px-3 py-1.5 text-xs font-medium text-flow-green">
                  <Check className="h-3.5 w-3.5" />
                  {t('leadCaptured')}
                </div>
              )}

              {error && (
                <p className="self-center rounded-full bg-red-50 px-3 py-1.5 text-xs text-red-700">
                  {error}
                </p>
              )}

              {messages.length === 0 && !pending && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {quickReplies.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      className="rounded-full border border-flow-green/25 bg-white px-3 py-1.5 text-xs
                                 font-medium text-flow-green transition-colors
                                 hover:bg-flow-green hover:text-flow-bg"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(draft)
              }}
              className="flex items-center gap-2 border-t border-flow-border bg-white px-3 py-3"
            >
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={MAX_CHARS}
                placeholder={t('placeholder')}
                aria-label={t('placeholder')}
                className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm text-flow-text
                           placeholder:text-flow-text-muted/70 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim() || pending}
                aria-label={t('send')}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-flow-green
                           text-flow-lime transition-colors hover:bg-flow-green-hover
                           disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4 rtl:-scale-x-100" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Bubble({ role, children }: { role: 'user' | 'model'; children: React.ReactNode }) {
  const mine = role === 'user'
  return (
    <div
      className={[
        'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
        mine
          ? 'self-end rounded-ee-md bg-flow-green text-flow-bg'
          : 'self-start rounded-es-md border border-flow-border bg-white text-flow-text',
      ].join(' ')}
    >
      {children}
    </div>
  )
}
