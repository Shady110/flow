'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { PORTAL_TABS } from './tabs'

/** Desktop header navigation: the same five places as the phone tab bar. */
export function PortalNav() {
  const pathname = usePathname()
  const t = useTranslations('portal.nav')
  return (
    <nav aria-label={t('menu')} className="hidden items-center gap-1 sm:flex">
      {PORTAL_TABS.map((item) => {
        const active = item.match.some((m) => (m === '/' ? pathname === '/' : pathname === m || pathname.startsWith(`${m}/`)))
        const Icon = item.icon
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors',
              active ? 'bg-[var(--brand)]/12 text-[var(--brand-ink)]' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{t(item.key)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
