import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { ArrowRight, CheckCircle2, FileSignature } from 'lucide-react'
import { requireClientContext } from '@/lib/auth/client-session'
import { getContracts } from '@/lib/db/contract-queries'
import { formatDate } from '@/lib/format'
import { PrintButton } from '@/components/dashboard/PrintButton'
import { AcceptContract } from '@/components/contracts/AcceptContract'
import { ContractDocument } from '@/components/contracts/ContractDocument'
import { Button } from '@/components/ds/button'

export default async function PortalContractPage() {
  const { client } = await requireClientContext()
  const [contracts, t, locale] = await Promise.all([getContracts(client.id), getTranslations('portal.contract'), getLocale()])
  // RLS already hides drafts. Show what needs signing first, then the latest signed one.
  const contract = contracts.find((c) => c.status === 'sent') ?? contracts.find((c) => c.status === 'accepted')

  if (!contract) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t('title')}</h1>
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <FileSignature className="h-10 w-10 text-muted-foreground" />
          <p className="text-base text-muted-foreground">{t('none')}</p>
        </div>
      </div>
    )
  }

  const signed = contract.status === 'accepted'
  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="mt-1 text-base text-muted-foreground">{signed ? t('signedHelp') : t('readHelp')}</p>
        </div>
        <PrintButton />
      </div>

      {signed && (
        <div className="no-print flex flex-col gap-4 rounded-3xl bg-flow-lime/30 p-5 sm:flex-row sm:items-center">
          <CheckCircle2 className="h-9 w-9 shrink-0 text-flow-green" />
          <div className="flex-1">
            <p className="font-display text-xl font-bold">{t('signedTitle')}</p>
            <p className="text-base text-muted-foreground">
              {t('signedBy', { name: contract.accepted_name ?? '', date: contract.accepted_at ? formatDate(contract.accepted_at, locale) : '' })}
            </p>
          </div>
          <Button asChild size="lg" className="h-12">
            <Link href="/papers">{t('nextPapers')} <ArrowRight className="h-5 w-5 rtl:-scale-x-100" /></Link>
          </Button>
        </div>
      )}

      <ContractDocument contract={contract} clientName={client.name} portal />
      {!signed && <AcceptContract contractId={contract.id} />}
    </div>
  )
}
