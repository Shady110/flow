'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LogOut, UserRound } from 'lucide-react'
import { signOut } from '@/lib/auth/actions'
import { Avatar, AvatarFallback } from '@/components/ds/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ds/dropdown-menu'
import { cn } from '@/lib/utils'

function initials(name: string, email: string) {
  const base = name?.trim() || email
  return base
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('')
}

/** The signed-in person at the foot of the sidebar: name and role, with account and sign-out in a menu. `compact` is the rail's avatar alone. */
export function AccountMenu({
  name,
  email,
  roleName,
  compact = false,
}: {
  name: string
  email: string
  roleName: string | null
  compact?: boolean
}) {
  const t = useTranslations('common')
  const ta = useTranslations('auth.account')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-3 rounded-2xl text-start outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
          compact ? 'justify-center p-1' : 'w-full p-2',
        )}
      >
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-flow-green text-xs font-semibold text-flow-lime">{initials(name, email)}</AvatarFallback>
        </Avatar>
        {!compact && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium leading-tight text-foreground">{name || email}</span>
            {roleName && <span className="block truncate text-xs text-muted-foreground">{roleName}</span>}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/account">
            <UserRound className="me-2 h-4 w-4" /> {ta('title')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <form action={signOut}>
            <button type="submit" className="flex w-full items-center">
              <LogOut className="me-2 h-4 w-4" /> {t('signOut')}
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
