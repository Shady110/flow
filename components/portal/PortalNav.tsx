'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LayoutDashboard, Package, ListChecks, FileText, MessageSquare, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS: { key: string; href: string; icon: LucideIcon }[] = [
  { key: 'overview', href: '/', icon: LayoutDashboard },
  { key: 'products', href: '/products', icon: Package },
  { key: 'tasks', href: '/tasks', icon: ListChecks },
  { key: 'invoices', href: '/invoices', icon: FileText },
  { key: 'chat', href: '/chat', icon: MessageSquare },
]

export function PortalNav() {
  const pathname = usePathname()
  const t = useTranslations('portal.nav')
  return (
    <nav className="flex items-center gap-1">
      {ITEMS.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-secondary text-secondary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{t(item.key)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
