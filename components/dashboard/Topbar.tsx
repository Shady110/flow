'use client'

import Link from 'next/link'
import { LogOut, MessageSquare } from 'lucide-react'
import { signOut } from '@/lib/auth/actions'
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
}

function initials(name: string, email: string) {
  const base = name?.trim() || email
  return base
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('')
}

export function Topbar({ name, email, roleName, canChat }: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-end gap-3 border-b border-border bg-background/80 px-6 backdrop-blur">
      {canChat && (
        <Link
          href="/inbox"
          aria-label="Inbox"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MessageSquare className="h-5 w-5" />
        </Link>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight text-foreground">{name || email}</p>
            {roleName && (
              <p className="text-xs capitalize text-muted-foreground">{roleName}</p>
            )}
          </div>
          <Avatar className="h-9 w-9">
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
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
