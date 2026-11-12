import { getTranslations } from 'next-intl/server'
import { requirePermission } from '@/lib/auth/session'
import { getContractTemplates } from '@/lib/db/contract-queries'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ContractTemplatesManager } from '@/components/contracts/ContractTemplatesManager'

export default async function ContractTemplatesPage() {
  await requirePermission('contracts.manage')
  const [templates, t] = await Promise.all([getContractTemplates(), getTranslations('internal.contracts')])
  return (
    <div className="space-y-6">
      <PageHeader title={t('templatesTitle')} description={t('templatesDescription')} />
      <ContractTemplatesManager templates={templates} />
    </div>
  )
}
