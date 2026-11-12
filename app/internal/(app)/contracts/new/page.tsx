import { getTranslations } from 'next-intl/server'
import { requirePermission } from '@/lib/auth/session'
import { getComposerData } from '@/lib/db/contract-composer-data'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ContractComposer } from '@/components/contracts/ContractComposer'

export default async function NewContractPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>
}) {
  await requirePermission('contracts.manage')
  const [{ client }, { clients, templates }, t] = await Promise.all([
    searchParams,
    getComposerData(),
    getTranslations('internal.contracts'),
  ])
  return (
    <div className="space-y-6">
      <PageHeader title={t('newContract')} description={t('newDescription')} />
      <ContractComposer clients={clients} templates={templates} initialClientId={client} />
    </div>
  )
}
