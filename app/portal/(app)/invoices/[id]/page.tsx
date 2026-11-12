import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { ArrowLeft } from 'lucide-react'
import { requireClientContext } from '@/lib/auth/client-session'
import { getInvoice } from '@/lib/db/finance-queries'
import { getPortalSettings } from '@/lib/db/portal-settings'
import { whatsappUrl } from '@/lib/contact'
import { formatMoney } from '@/lib/money'
import { InvoiceDocument } from '@/components/finance/InvoiceDocument'
import { PrintButton } from '@/components/dashboard/PrintButton'
import { HowToPay } from '@/components/portal/HowToPay'
import { PayOnlineButton } from '@/components/portal/PayOnlineButton'
import { getPortalPayments } from '@/lib/db/payment-queries'

export default async function PortalInvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { client } = await requireClientContext()
  const { id } = await params
  const [invoice, t, locale, settings, pays] = await Promise.all([
    getInvoice(id),
    getTranslations('portal.payments'),
    getLocale(),
    getPortalSettings(),
    getPortalPayments(client.id),
  ])
  // RLS already scopes to the tenant, but double-check ownership defensively.
  if (!invoice || invoice.client_id !== client.id || invoice.status === 'draft') notFound()

  const instructions = locale === 'ar' ? settings.paymentInstructions.ar || settings.paymentInstructions.en : settings.paymentInstructions.en || settings.paymentInstructions.ar

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link href="/invoices" className="inline-flex min-h-11 items-center gap-2 text-base font-medium text-[var(--brand-ink)]">
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" /> {t('backToPayments')}
        </Link>
        <PrintButton />
      </div>
      {invoice.balance > 0 && (
        <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-start">
          {pays.online && invoice.status === 'sent' && (
            <PayOnlineButton invoiceId={invoice.id} amountText={formatMoney(invoice.balance, invoice.currency, 0, locale)} className="h-14 w-full text-base sm:w-auto sm:px-10" />
          )}
          <HowToPay
            amountText={formatMoney(invoice.balance, invoice.currency, 0, locale)}
            reference={invoice.number}
            instructions={instructions}
            receiptHref={whatsappUrl(settings.whatsapp, t('receiptText', { number: invoice.number }))}
            label={pays.online ? t('payOr') : t('howToPay')}
            variant={pays.online ? 'outline' : 'default'}
            className="h-14 w-full text-base sm:w-auto sm:px-10"
          />
        </div>
      )}
      <InvoiceDocument invoice={invoice} portal />
    </div>
  )
}
