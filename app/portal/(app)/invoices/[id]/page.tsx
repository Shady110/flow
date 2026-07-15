import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { requireClientContext } from '@/lib/auth/client-session'
import { getInvoice } from '@/lib/db/finance-queries'
import { InvoiceDocument } from '@/components/finance/InvoiceDocument'
import { PrintButton } from '@/components/dashboard/PrintButton'

export default async function PortalInvoiceDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { client } = await requireClientContext()
  const { id } = await params
  const invoice = await getInvoice(id)
  // RLS already scopes to the tenant, but double-check ownership defensively.
  if (!invoice || invoice.client_id !== client.id || invoice.status === 'draft') notFound()

  return (
    <div className="space-y-6">
      <div className="no-print flex items-center justify-between gap-3">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to invoices
        </Link>
        <PrintButton />
      </div>
      <InvoiceDocument invoice={invoice} portal />
    </div>
  )
}
