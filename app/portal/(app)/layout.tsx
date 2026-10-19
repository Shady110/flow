import { LogOut } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { requireClientContext } from '@/lib/auth/client-session'
import { signOut } from '@/lib/auth/actions'
import { PortalNav } from '@/components/portal/PortalNav'
import { PortalTabBar } from '@/components/portal/PortalTabBar'
import { getPlatforms } from '@/lib/db/flow-queries'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ds/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ds/avatar'

export default async function PortalAppLayout({ children }: { children: React.ReactNode }) {
  const { client, clientUser, email } = await requireClientContext()
  const t = await getTranslations('common')
  const showTickets = (await getPlatforms(client.id)).some((p) => p.stage === 'managing')
  const accent = client.brand_color || '#143C28'
  const initials = clientUser.full_name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="min-h-screen bg-background">
      <div className="h-1 w-full" style={{ background: accent }} />
      <header className="sticky top-0 z-10 border-b border-border/60 bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex min-w-0 items-center gap-3">
            {client.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={client.logo_url} alt={client.name} className="h-8 w-8 rounded object-contain" />
            ) : (
              <span
                className="flex h-8 w-8 items-center justify-center rounded font-display text-sm font-bold text-white"
                style={{ background: accent }}
              >
                {client.name[0]?.toUpperCase()}
              </span>
            )}
            <span className="truncate font-display text-lg font-bold tracking-tight">{client.name}</span>
          </div>

          <PortalNav showTickets={showTickets} />

          <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
                  {initials}
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
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:py-8 sm:pb-8">{children}</main>
      <PortalTabBar showTickets={showTickets} />
    </div>
  )
}
