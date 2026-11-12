import { getTranslations } from 'next-intl/server'
import { requirePermission } from '@/lib/auth/session'
import { getCompanySettings } from '@/lib/db/flow-queries'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { CompanySettings } from '@/components/flow/CompanySettings'

export default async function CompanySettingsPage() {
  await requirePermission('settings.company')
  const [settings, t] = await Promise.all([getCompanySettings(), getTranslations('internal.company')])
  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />
      <CompanySettings settings={settings} />
    </div>
  )
}
