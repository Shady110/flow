'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { INTERNAL_NAV, canSee } from './nav'
import type { PermissionKey } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * The grouped menu, shared by the desktop sidebar and the phone drawer.
 * Items are filtered by the viewer's permissions; a section heading shows only
 * when at least one of its items does.
 */
export function SidebarNav({
  permissions,
  onNavigate,
}: {
  permissions: PermissionKey[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const t = useTranslations('internal.nav')
  const permSet = new Set(permissions)
  const items = INTERNAL_NAV.filter((i) => canSee(i, permSet))

  return (
    <nav className="space-y-0.5">
      {items.map((item, i) => {
        const heading = item.section && item.section !== items[i - 1]?.section
        // Settings stands alone below the groups, set off by a thin rule.
        const divider = !item.section && !!items[i - 1]?.section
        // The most specific item wins, so /accounts/tickets doesn't also light up /accounts.
        const active =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href) &&
              !items.some((o) => o.href.length > item.href.length && pathname.startsWith(o.href))
        const Icon = item.icon
        return (
          <div key={item.href}>
            {divider && <div className="mx-3 my-3 border-t border-border/70" />}
            {heading && (
              <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {t(`sections.${item.section}`)}
              </p>
            )}
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-secondary text-flow-green before:absolute before:inset-y-2 before:start-0 before:w-1 before:rounded-e-full before:bg-flow-green'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1 truncate">{t(item.key)}</span>
              {item.soon && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  soon
                </span>
              )}
            </Link>
          </div>
        )
      })}
    </nav>
  )
}
