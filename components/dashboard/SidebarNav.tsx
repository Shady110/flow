'use client'

import { useState } from 'react'
import Link, { useLinkStatus } from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import { DEPARTMENT_NAV, INTERNAL_NAV, canSee, type NavItem } from './nav'
import type { PermissionKey } from '@/lib/types'
import { cn } from '@/lib/utils'

/** A small dot that pulses while the link's page is loading. */
function Pending() {
  const { pending } = useLinkStatus()
  return pending ? <span aria-hidden className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-flow-green" /> : null
}

/**
 * The grouped menu, shared by the desktop sidebar and the phone drawer.
 * Items are filtered by the viewer's permissions. A person in a department sees
 * that department's pages first and the rest under a collapsed "Other areas";
 * everyone else sees the full grouped list. `collapsed` renders the icon rail.
 */
export function SidebarNav({
  permissions,
  department,
  collapsed = false,
  onNavigate,
}: {
  permissions: PermissionKey[]
  department?: string | null
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const t = useTranslations('internal.nav')
  const [othersOpen, setOthersOpen] = useState(false)
  const permSet = new Set(permissions)
  const items = INTERNAL_NAV.filter((i) => canSee(i, permSet))

  // The most specific item wins, so /accounts/tickets doesn't also light up /accounts.
  const isActive = (item: NavItem) =>
    item.href === '/'
      ? pathname === '/'
      : pathname.startsWith(item.href) &&
        !items.some((o) => o.href.length > item.href.length && pathname.startsWith(o.href))

  const renderItem = (item: NavItem) => {
    const active = isActive(item)
    const Icon = item.icon
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        title={collapsed ? t(item.key) : undefined}
        aria-label={collapsed ? t(item.key) : undefined}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'relative flex items-center gap-3 rounded-xl py-2 text-sm font-medium transition-colors',
          collapsed ? 'justify-center px-0' : 'px-3',
          active
            ? 'bg-secondary text-flow-green before:absolute before:inset-y-2 before:start-0 before:w-1 before:rounded-e-full before:bg-flow-green'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{t(item.key)}</span>
            {item.soon && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">soon</span>
            )}
            <Pending />
          </>
        )}
      </Link>
    )
  }

  const heading = (text: string) =>
    collapsed ? <div className="mx-3 my-3 border-t border-border/70" /> : (
      <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{text}</p>
    )

  const mine = department ? DEPARTMENT_NAV[department] : undefined

  if (mine) {
    const top = items.filter((i) => i.key === 'overview' || i.key === 'inbox')
    const primary = items.filter((i) => mine.includes(i.key))
    const settings = items.filter((i) => i.key === 'settings')
    const taken = new Set([...top, ...primary, ...settings].map((i) => i.key))
    const others = items.filter((i) => !taken.has(i.key))
    // Keep a page you are standing on visible even when it sits under "Other areas".
    const open = othersOpen || others.some(isActive)
    return (
      <nav className="space-y-0.5">
        {top.map(renderItem)}
        {primary.length > 0 && heading(t(`departments.${department}`))}
        {primary.map(renderItem)}
        {others.length > 0 && (
          <>
            {collapsed ? <div className="mx-3 my-3 border-t border-border/70" /> : (
              <button
                type="button"
                onClick={() => setOthersOpen((v) => !v)}
                aria-expanded={open}
                className="flex w-full items-center justify-between px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-foreground"
              >
                {t('otherAreas')}
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
              </button>
            )}
            {(open || collapsed) && others.map(renderItem)}
          </>
        )}
        {settings.length > 0 && <div className="mx-3 my-3 border-t border-border/70" />}
        {settings.map(renderItem)}
      </nav>
    )
  }

  return (
    <nav className="space-y-0.5">
      {items.map((item, i) => {
        const showHeading = item.section && item.section !== items[i - 1]?.section
        // Settings stands alone below the groups, set off by a thin rule.
        const divider = !item.section && !!items[i - 1]?.section
        return (
          <div key={item.href}>
            {divider && <div className="mx-3 my-3 border-t border-border/70" />}
            {showHeading && heading(t(`sections.${item.section}`))}
            {renderItem(item)}
          </div>
        )
      })}
    </nav>
  )
}
