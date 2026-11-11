'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { MessageSquare } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { AccountMenu } from './AccountMenu'
import { cn } from '@/lib/utils'

export interface SidebarUser {
  name: string
  email: string
  roleName: string | null
  canChat: boolean
}

/** Language, light/dark, inbox and the signed-in person: what used to live in the top bar. */
export function SidebarControls({ user, compact = false }: { user: SidebarUser; compact?: boolean }) {
  const ts = useTranslations('internal.shell')
  return (
    <div className={cn('space-y-1 border-t border-border/70 pt-3', compact && 'flex flex-col items-center')}>
      <div className={cn('flex items-center gap-1', compact ? 'flex-col' : 'px-1')}>
        <LanguageSwitcher className="px-2.5" />
        <NotificationBell align="start" />
        {user.canChat && (
          <Link
            href="/inbox"
            aria-label={ts('inbox')}
            title={ts('inbox')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MessageSquare className="h-4 w-4" />
          </Link>
        )}
      </div>
      <AccountMenu name={user.name} email={user.email} roleName={user.roleName} compact={compact} />
    </div>
  )
}
