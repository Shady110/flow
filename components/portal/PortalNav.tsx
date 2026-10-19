'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LayoutDashboard, Package, ListChecks, FileText, ClipboardCheck, FileSignature, LifeBuoy, MessageSquare, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS: { key: string; href: string; icon: LucideIcon }[] = [
  { key: 'overview', href: '/', icon: LayoutDashboard },
  { key: 'contract', href: '/contract', icon: FileSignature },
  { key: 'documents', href: '/documents', icon: ClipboardCheck },
  { key: 'products', href: '/products', icon: Package },
  { key: 'tasks', href: '/tasks', icon: ListChecks },
  { key: 'tickets', href: '/tickets', icon: LifeBuoy },
  { key: 'invoices', href: '/invoices', icon: FileText },
  { key: 'chat', href: '/chat', icon: MessageSquare },
]

/** `showTickets` is false until an account is live on a marketplace. */
export function PortalNav({ showTickets = false }: { showTickets?: boolean }) {
  const pathname = usePathname()
  const t = useTranslations('portal.nav')
  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {ITEMS.filter((i) => i.key !== 'tickets' || showTickets).map((item) => {
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
            <span>{t(item.key)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
