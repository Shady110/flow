import { getTranslations } from 'next-intl/server'
import { requirePermission } from '@/lib/auth/session'
import { getTemplates } from '@/lib/db/requirement-queries'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { RequirementTemplatesManager } from '@/components/flow/RequirementTemplatesManager'

export default async function RequirementsSettingsPage() {
  await requirePermission('requirements.manage')
  const [templates, t] = await Promise.all([getTemplates(), getTranslations('internal.requirements')])
  return (
    <div className="space-y-6">
      <PageHeader title={t('pageTitle')} description={t('pageDescription')} />
      <RequirementTemplatesManager templates={templates} />
    </div>
  )
}
