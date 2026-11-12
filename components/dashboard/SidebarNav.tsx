'use client'

import Link, { useLinkStatus } from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { INTERNAL_NAV, canSee, type NavItem } from './nav'
import type { PermissionKey } from '@/lib/types'
import { cn } from '@/lib/utils'

/** A small dot that pulses while the link's page is loading. */
function Pending() {
  const { pending } = useLinkStatus()
  return pending ? <span aria-hidden className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-flow-green" /> : null
}

/**
 * The grouped menu, shared by the desktop sidebar and the phone drawer.
 * Items are filtered by the viewer's permissions (the owner sees everything). `collapsed` renders the icon rail.
 */
export function SidebarNav({
  permissions,
  collapsed = false,
  onNavigate,
}: {
  permissions: PermissionKey[]
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const t = useTranslations('internal.nav')
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
            ? 'bg-secondary text-primary before:absolute before:inset-y-2 before:start-0 before:w-1 before:rounded-e-full before:bg-primary'
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
