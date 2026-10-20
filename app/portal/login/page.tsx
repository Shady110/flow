import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { brandCss, normalizeHex, readableOn } from '@/lib/brand'
import { whatsappUrl } from '@/lib/contact'
import { getPortalSettings } from '@/lib/db/portal-settings'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { LoginForm } from '@/components/portal/LoginForm'

/** The first thing a client sees: their own name and colour, in their language. */
export default async function PortalLoginPage() {
  const slug = (await headers()).get('x-tenant-slug')
  const [t, settings, { data: client }] = await Promise.all([
    getTranslations('portal.login'),
    getPortalSettings(),
    // Public branding only (name, logo, colour) for the tenant on this address.
    slug
      ? createAdminClient().from('clients').select('name, logo_url, brand_color').eq('slug', slug).maybeSingle()
      : Promise.resolve({ data: null }),
  ])
  const brand = normalizeHex(client?.brand_color)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <style dangerouslySetInnerHTML={{ __html: brandCss(client?.brand_color) }} />
      <div className="flex justify-end p-4">
        <LanguageSwitcher className="min-h-11 px-3" />
      </div>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-5 pb-16">
        <div className="flex flex-col items-center gap-4 text-center">
          {client?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={client.logo_url} alt="" className="h-20 w-20 rounded-3xl object-contain" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-3xl font-display text-3xl font-bold" style={{ background: brand, color: readableOn(brand) }}>
              {(client?.name ?? 'F')[0]?.toUpperCase()}
            </span>
          )}
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">{client?.name ? t('welcomeNamed', { name: client.name }) : t('welcome')}</h1>
            <p className="mt-2 text-base text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-md)] sm:p-7">
          <LoginForm helpHref={whatsappUrl(settings.whatsapp, t('helpText'))} />
        </div>
      </main>
    </div>
  )
}
