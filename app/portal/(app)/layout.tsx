import { LogOut, MessageCircle } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { requireClientContext } from '@/lib/auth/client-session'
import { signOut } from '@/lib/auth/actions'
import { brandCss, normalizeHex, readableOn } from '@/lib/brand'
import { whatsappUrl } from '@/lib/contact'
import { getPortalSettings } from '@/lib/db/portal-settings'
import { PortalNav } from '@/components/portal/PortalNav'
import { PortalTabBar } from '@/components/portal/PortalTabBar'
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
  const [t, tp, settings] = await Promise.all([
    getTranslations('common'),
    getTranslations('portal.common'),
    getPortalSettings(),
  ])
  const brand = normalizeHex(client.brand_color)
  const wa = whatsappUrl(settings.whatsapp)
  const initials = clientUser.full_name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="min-h-screen bg-background">
      {/* The client's colour re-themes every button, tab and ring in the portal. */}
      <style dangerouslySetInnerHTML={{ __html: brandCss(client.brand_color) }} />

      <header className="sticky top-0 z-10 border-b border-border/60 bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            {client.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={client.logo_url} alt="" className="h-10 w-10 shrink-0 rounded-xl object-contain" />
            ) : (
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-base font-bold"
                style={{ background: brand, color: readableOn(brand) }}
              >
                {client.name[0]?.toUpperCase()}
              </span>
            )}
            <span className="truncate font-display text-lg font-bold tracking-tight">{client.name}</span>
          </div>

          <PortalNav />

          <div className="flex shrink-0 items-center gap-1.5">
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tp('whatsapp')}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0f7a5c] text-white transition-transform hover:scale-105"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            )}
            <LanguageSwitcher className="min-h-11 px-3" />
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={tp('account')}
                className="flex h-11 w-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-secondary text-sm font-semibold text-secondary-foreground">{initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer py-3">
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

      <main className="mx-auto max-w-5xl px-4 py-6 pb-32 sm:py-8 sm:pb-10">{children}</main>
      <PortalTabBar />
    </div>
  )
}
