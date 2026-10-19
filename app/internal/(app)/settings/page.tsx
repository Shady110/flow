import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { ChevronRight } from 'lucide-react'
import { requireUser } from '@/lib/auth/session'
import { SETTINGS_PAGES, canSee } from '@/components/dashboard/nav'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card } from '@/components/ds/card'

/** One door for rarely-used configuration, so the sidebar doesn't list each page. */
export default async function SettingsHubPage() {
  const user = await requireUser()
  const pages = SETTINGS_PAGES.filter((p) => canSee(p, user.permissions))
  if (pages.length === 0) redirect('/')
  const [t, tn] = await Promise.all([getTranslations('internal.settingsHub'), getTranslations('internal.nav')])

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {pages.map((p) => {
          const Icon = p.icon
          return (
            <Link key={p.key} href={p.href} className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Card className="h-full gap-3 p-5 transition-shadow group-hover:shadow-[var(--shadow-md)]">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-flow-green">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold tracking-tight">{tn(p.key)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t(p.key)}</p>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
