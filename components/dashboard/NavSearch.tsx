'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'
import { INTERNAL_NAV } from './nav'
import type { PermissionKey } from '@/lib/types'

/**
 * Jump-to-page box. It only filters the menu the viewer already has (no search
 * index): type, press Enter for the first match, or pick one. ⌘K / Ctrl+K focuses it.
 */
export function NavSearch({ permissions }: { permissions: PermissionKey[] }) {
  const router = useRouter()
  const t = useTranslations('internal.nav')
  const ts = useTranslations('internal.shell')
  const input = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        input.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const perms = new Set(permissions)
  const term = q.trim().toLowerCase()
  const matches = term
    ? INTERNAL_NAV.filter((i) => !i.soon && (!i.permission || perms.has(i.permission)))
        .filter((i) => t(i.key).toLowerCase().includes(term))
        .slice(0, 6)
    : []

  function go(href: string) {
    setQ('')
    setOpen(false)
    input.current?.blur()
    router.push(href)
  }

  return (
    <div className="relative hidden w-full max-w-sm sm:block">
      <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={input}
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && matches[0]) go(matches[0].href)
          if (e.key === 'Escape') {
            setQ('')
            input.current?.blur()
          }
        }}
        placeholder={ts('search')}
        aria-label={ts('search')}
        className="h-10 w-full rounded-full bg-muted ps-10 pe-14 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
      />
      {!q && (
        <kbd className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 rounded-md bg-card px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground shadow-[var(--shadow-xs)]">
          ⌘K
        </kbd>
      )}
      {open && term && (
        <ul className="absolute start-0 top-12 z-30 w-full overflow-hidden rounded-2xl bg-card p-1.5 shadow-[var(--shadow-md)]">
          {matches.length === 0 && <li className="px-3 py-2 text-sm text-muted-foreground">{ts('noResults')}</li>}
          {matches.map((m) => {
            const Icon = m.icon
            return (
              <li key={m.href}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(m.href)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start text-sm hover:bg-muted"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {t(m.key)}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
