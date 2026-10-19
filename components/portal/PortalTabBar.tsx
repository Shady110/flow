'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LayoutDashboard, ClipboardCheck, LifeBuoy, FileText, MessageSquare, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS: { key: string; href: string; icon: LucideIcon }[] = [
  { key: 'overview', href: '/', icon: LayoutDashboard },
  { key: 'documents', href: '/documents', icon: ClipboardCheck },
  { key: 'tickets', href: '/tickets', icon: LifeBuoy },
  { key: 'invoices', href: '/invoices', icon: FileText },
  { key: 'chat', href: '/chat', icon: MessageSquare },
]

/**
 * Phone navigation: the five things a client reaches for, thumb-high at the
 * bottom of the screen. Hidden from `sm` up, where the header nav takes over.
 * Support only appears once an account is live.
 */
export function PortalTabBar({ showTickets }: { showTickets: boolean }) {
  const pathname = usePathname()
  const t = useTranslations('portal.nav')
  return (
    <nav
      aria-label={t('overview')}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
    >
      <ul className="flex">
        {TABS.filter((i) => i.key !== 'tickets' || showTickets).map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium transition-colors',
                  active ? 'text-flow-green' : 'text-muted-foreground',
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
                <span className="truncate">{t(item.key)}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
