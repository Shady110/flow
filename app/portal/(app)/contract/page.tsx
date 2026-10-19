import { getTranslations } from 'next-intl/server'
import { requireClientContext } from '@/lib/auth/client-session'
import { getContracts } from '@/lib/db/contract-queries'
import { PrintButton } from '@/components/dashboard/PrintButton'
import { AcceptContract } from '@/components/contracts/AcceptContract'
import { ContractDocument } from '@/components/contracts/ContractDocument'

export default async function PortalContractPage() {
  const { client } = await requireClientContext()
  const [contracts, t] = await Promise.all([getContracts(client.id), getTranslations('portal.contract')])
  // RLS already hides drafts. Show what needs signing first, then the latest signed one.
  const contract = contracts.find((c) => c.status === 'sent') ?? contracts.find((c) => c.status === 'accepted')

  if (!contract) {
    return (
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t('none')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {contract.status === 'sent' ? t('readAndAccept') : t('signed')}
          </p>
        </div>
        <PrintButton />
      </div>
      <ContractDocument contract={contract} clientName={client.name} />
      {contract.status === 'sent' && <AcceptContract contractId={contract.id} />}
    </div>
  )
}
