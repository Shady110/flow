import { getTranslations } from 'next-intl/server'
import { requirePermission } from '@/lib/auth/session'
import { getLandingContentRows } from '@/lib/db/landing'
import LandingContentManager from '@/components/dashboard/LandingContentManager'

export const metadata = { title: 'Landing content' }

export default async function LandingContentPage() {
  await requirePermission('content.manage')
  const t = await getTranslations('internal.nav')
  const rows = await getLandingContentRows()

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">{t('landing')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit the public landing page copy in English and Arabic. Changes go live immediately.
        </p>
      </div>
      <LandingContentManager rows={rows} />
    </div>
  )
}
