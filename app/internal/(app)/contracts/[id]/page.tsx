import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { requirePermission } from '@/lib/auth/session'
import { getClient } from '@/lib/db/queries'
import { getContract } from '@/lib/db/contract-queries'
import { getComposerData } from '@/lib/db/contract-composer-data'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { PrintButton } from '@/components/dashboard/PrintButton'
import { ContractActions } from '@/components/contracts/ContractActions'
import { ContractComposer } from '@/components/contracts/ContractComposer'
import { ContractDocument } from '@/components/contracts/ContractDocument'
import { ContractStatusBadge } from '@/components/contracts/ContractStatusBadge'

export default async function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission('contracts.manage')
  const { id } = await params
  const contract = await getContract(id)
  if (!contract) notFound()
  const [client, t] = await Promise.all([getClient(contract.client_id), getTranslations('internal.contracts')])

  const editable = contract.status === 'draft'
  const composer = editable ? await getComposerData() : null

  return (
    <div className="space-y-6">
      <div className="no-print">
        <Link href="/contracts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {t('backToContracts')}
        </Link>
      </div>
      <div className="no-print">
        <PageHeader
          title={contract.title}
          description={client?.name}
          actions={
            <>
              <ContractStatusBadge status={contract.status} label={t(`status_${contract.status}`)} />
              {!editable && <PrintButton />}
            </>
          }
        />
      </div>
      <ContractActions id={contract.id} status={contract.status} />
      {composer ? (
        <ContractComposer clients={composer.clients} templates={composer.templates} contract={contract} />
      ) : (
        <ContractDocument contract={contract} clientName={client?.name ?? ''} />
      )}
    </div>
  )
}
