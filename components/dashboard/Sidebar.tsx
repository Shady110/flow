'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react'
import { SidebarNav } from './SidebarNav'
import { CapCard } from './CapCard'
import { Brand } from './Brand'
import { NavSearch } from './NavSearch'
import { SidebarControls, type SidebarUser } from './SidebarControls'
import type { PermissionKey } from '@/lib/types'
import { cn } from '@/lib/utils'

export const SIDEBAR_COOKIE = 'flow-sidebar'

/**
 * Floating desktop sidebar: 264px, or a 72px icon rail. Ctrl/Cmd+B toggles it and
 * the choice is kept in a cookie so the server renders the right width on the
 * next visit (no jump). Below `lg` the same menu lives in the Topbar's drawer.
 */
export function Sidebar({
  permissions,
  cap,
  capHref,
  user,
  initialCollapsed = false,
}: {
  permissions: PermissionKey[]
  /** Shown to anyone who can see leads. */
  cap?: { won: number; cap: number } | null
  /** Where the cap card goes: the leads page for sales, the sales insights for the CEO. */
  capHref?: string
  user: SidebarUser
  initialCollapsed?: boolean
}) {
  const t = useTranslations('internal.shell')
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  const toggle = useCallback(() => {
    setCollapsed((c) => {
      document.cookie = `${SIDEBAR_COOKIE}=${c ? 'open' : 'rail'}; path=/; max-age=31536000; samesite=lax`
      return !c
    })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])

  return (
    <aside
      className={cn(
        'sticky top-4 hidden h-[calc(100vh-2rem)] shrink-0 flex-col rounded-3xl bg-card p-4 shadow-[var(--shadow-sm)] transition-[width] duration-200 motion-reduce:transition-none lg:flex',
        collapsed ? 'w-[72px] items-center px-3' : 'w-64',
      )}
    >
      <div className={cn('pb-2 pt-1', collapsed ? 'px-0' : 'px-2')}>
        <Brand compact={collapsed} />
      </div>
      <div className={cn('pb-3', collapsed ? 'flex w-full justify-center' : '')}>
        {collapsed ? (
          <button
            type="button"
            onClick={toggle}
            aria-label={t('search')}
            title={t('search')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
          >
            <Search className="h-4 w-4" />
          </button>
        ) : (
          <NavSearch permissions={permissions} />
        )}
      </div>
      <div className={cn('flex-1 overflow-y-auto pb-4', collapsed ? 'w-full' : '-mx-1 px-1')}>
        <SidebarNav permissions={permissions} collapsed={collapsed} />
      </div>
      {cap && !collapsed && <CapCard won={cap.won} cap={cap.cap} href={capHref} />}
      <SidebarControls user={user} compact={collapsed} />
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? t('expandMenu') : t('collapseMenu')}
        title={`${collapsed ? t('expandMenu') : t('collapseMenu')} (Ctrl+B)`}
        className="mt-2 flex h-9 w-9 items-center justify-center self-end rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {collapsed ? <PanelLeftOpen className="h-4 w-4 rtl:rotate-180" /> : <PanelLeftClose className="h-4 w-4 rtl:rotate-180" />}
      </button>
    </aside>
  )
}
