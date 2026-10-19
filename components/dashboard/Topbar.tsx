'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LogOut, MessageSquare } from 'lucide-react'
import { MobileNav } from './MobileNav'
import { NavSearch } from './NavSearch'
import type { PermissionKey } from '@/lib/types'
import { signOut } from '@/lib/auth/actions'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import {
  Avatar,
  AvatarFallback,
} from '@/components/ds/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ds/dropdown-menu'

interface TopbarProps {
  name: string
  email: string
  roleName: string | null
  canChat?: boolean
  permissions: PermissionKey[]
}

function initials(name: string, email: string) {
  const base = name?.trim() || email
  return base
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('')
}

export function Topbar({ name, email, roleName, canChat, permissions }: TopbarProps) {
  const t = useTranslations('common')
  return (
    <header className="flex h-16 items-center gap-3 rounded-2xl bg-card px-3 shadow-[var(--shadow-sm)] sm:px-4">
      <MobileNav permissions={permissions} />
      <NavSearch permissions={permissions} />
      <div className="flex-1" />
      <LanguageSwitcher />
      {canChat && (
        <Link
          href="/inbox"
          aria-label="Inbox"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageSquare className="h-5 w-5" />
        </Link>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div className="hidden text-end sm:block">
            <p className="text-sm font-medium leading-tight text-foreground">{name || email}</p>
            {roleName && (
              <p className="text-xs capitalize text-muted-foreground">{roleName}</p>
            )}
          </div>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-flow-green text-flow-bg text-xs font-semibold">
              {initials(name, email)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer">
            <form action={signOut}>
              <button type="submit" className="flex w-full items-center">
                <LogOut className="me-2 h-4 w-4" /> {t('signOut')}
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
