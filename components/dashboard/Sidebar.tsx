'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { INTERNAL_NAV } from './nav'
import type { PermissionKey } from '@/lib/types'
import { cn } from '@/lib/utils'

export function Sidebar({ permissions }: { permissions: PermissionKey[] }) {
  const pathname = usePathname()
  const permSet = new Set(permissions)
  const items = INTERNAL_NAV.filter((i) => !i.permission || permSet.has(i.permission))

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 px-6">
        <span className="font-display text-xl font-bold tracking-tight text-flow-green">
          FLOW
        </span>
        <span className="rounded-full bg-flow-lime px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-flow-green">
          Ops
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.soon && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  soon
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
