'use client'

import { useCallback, useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/browser'
import {
  listNotificationsAction,
  markNotificationsReadAction,
  type NotificationItem,
} from '@/lib/db/notification-actions'
import { relativeTime } from '@/lib/overview'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ds/popover'
import { cn } from '@/lib/utils'

/**
 * The bell: unread count + the latest updates. Loads itself, then listens for new
 * rows (row-level security decides which ones this viewer may hear about).
 */
export function NotificationBell({ className, align = 'end' }: { className?: string; align?: 'start' | 'center' | 'end' }) {
  const t = useTranslations('notifications')
  const locale = useLocale()
  const router = useRouter()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const r = await listNotificationsAction()
      setItems(r.items)
      setUnread(r.unread)
    } catch {
      // The bell is a convenience: a failed load just leaves it quiet.
    }
  }, [])

  useEffect(() => {
    load()
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
        .channel('notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => load())
        .subscribe()
    })()
    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [load])

  function text(n: NotificationItem) {
    const values = { client: n.client_name ?? '', title: '', label: '', file: '', number: '', status: '', amount: '', name: '', ...n.payload }
    const key = `${n.audience}.${n.kind}`
    return t.has(key) ? t(key, values as Record<string, string>) : t('fallback')
  }

  async function openItem(n: NotificationItem) {
    setOpen(false)
    if (!n.read_at) {
      setItems((p) => p.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)))
      setUnread((u) => Math.max(0, u - 1))
      await markNotificationsReadAction([n.id])
    }
    if (n.href) router.push(n.href)
  }

  async function markAll() {
    setItems((p) => p.map((x) => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })))
    setUnread(0)
    await markNotificationsReadAction()
  }

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) load() }}>
      <PopoverTrigger
        aria-label={unread ? t('labelUnread', { count: unread }) : t('label')}
        title={t('label')}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align={align} className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">{t('title')}</p>
          {unread > 0 && (
            <button type="button" onClick={markAll} className="text-xs font-medium text-primary hover:underline">
              {t('markAll')}
            </button>
          )}
        </div>
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <ul className="max-h-96 divide-y divide-border overflow-y-auto">
            {items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => openItem(n)}
                  className={cn('flex w-full items-start gap-3 px-4 py-3 text-start transition-colors hover:bg-muted', !n.read_at && 'bg-secondary/40')}
                >
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read_at ? 'bg-transparent' : 'bg-primary')} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm leading-snug">{text(n)}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{relativeTime(n.created_at, locale)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
