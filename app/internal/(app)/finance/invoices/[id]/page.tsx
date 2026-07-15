import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { requirePermission, getCurrentUser } from '@/lib/auth/session'
import { getInvoice } from '@/lib/db/finance-queries'
import { formatMoney } from '@/lib/money'
import { InvoiceDocument } from '@/components/finance/InvoiceDocument'
import { PrintButton } from '@/components/dashboard/PrintButton'
import { DeleteInvoiceButton } from '@/components/dashboard/DeleteInvoiceButton'
import { InvoiceStatusSelect } from '@/components/dashboard/InvoiceStatusSelect'
import { RecordPaymentDialog } from '@/components/dashboard/RecordPaymentDialog'
import { Button } from '@/components/ds/button'

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requirePermission('finance.view')
  const { id } = await params
  const [invoice, user] = await Promise.all([getInvoice(id), getCurrentUser()])
  if (!invoice) notFound()

  const canManage = !!user?.permissions.has('finance.manage')
  const canIssue = !!user?.permissions.has('invoices.issue')

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/finance"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to finance
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {canIssue && <InvoiceStatusSelect id={invoice.id} status={invoice.status} />}
          {canManage && invoice.balance > 0 && (
            <RecordPaymentDialog
              clients={[{ id: invoice.client_id, label: invoice.client_name }]}
              fixedClientId={invoice.client_id}
              fixedInvoiceId={invoice.id}
              trigger={<Button variant="outline">Record payment</Button>}
            />
          )}
          <PrintButton />
          {canManage && <DeleteInvoiceButton id={invoice.id} number={invoice.number} />}
        </div>
      </div>

      <InvoiceDocument invoice={invoice} />

      <p className="no-print text-center text-xs text-muted-foreground">
        Balance due: {formatMoney(invoice.balance, invoice.currency)}
      </p>
    </div>
  )
}
