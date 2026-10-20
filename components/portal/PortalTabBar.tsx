'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PORTAL_TABS } from './tabs'

/**
 * Phone navigation: the same five tabs everywhere, always. Big icons, readable
 * labels, 64px tall so a thumb finds them. From `sm` up the header nav takes over.
 */
export function PortalTabBar() {
  const pathname = usePathname()
  const t = useTranslations('portal.nav')
  return (
    <nav
      aria-label={t('menu')}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(8,23,14,0.06)] backdrop-blur sm:hidden"
    >
      <ul className="flex">
        {PORTAL_TABS.map((item) => {
          const active = isActive(pathname, item.match)
          const Icon: LucideIcon = item.icon
          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-xs font-medium transition-colors',
                  active ? 'text-[var(--brand-ink)]' : 'text-muted-foreground',
                )}
              >
                <span className={cn('flex h-8 w-14 items-center justify-center rounded-full transition-colors', active && 'bg-[var(--brand)]/12')}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="max-w-full truncate">{t(item.key)}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function isActive(pathname: string, match: string[]) {
  return match.some((m) => (m === '/' ? pathname === '/' : pathname === m || pathname.startsWith(`${m}/`)))
}
