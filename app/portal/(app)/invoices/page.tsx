import { requireClientContext } from '@/lib/auth/client-session'
import { getInvoices } from '@/lib/db/finance-queries'
import { getPortalSettings } from '@/lib/db/portal-settings'
import { getPortalPayments } from '@/lib/db/payment-queries'
import { latestAcceptedDeal } from '@/lib/payments/billing-run'
import { InvoicesView } from '@/components/portal/InvoicesView'

export default async function PortalInvoices({ searchParams }: { searchParams: Promise<{ pay?: string }> }) {
  const { client } = await requireClientContext()
  const [all, settings, pays, { pay }] = await Promise.all([getInvoices(client.id), getPortalSettings(), getPortalPayments(client.id), searchParams])
  // Drafts are ours; voided invoices are not the client's business.
  const invoices = all.filter((i) => i.status === 'sent' || i.status === 'paid')
  // The monthly tick-box only makes sense with a signed contract to describe the agreement.
  const offerAuto = pays.recurring && !!(await latestAcceptedDeal(client.id))
  const payResult = pay === 'ok' || pay === 'failed' || pay === 'pending' ? pay : undefined
  return (
    <InvoicesView
      invoices={invoices}
      whatsapp={settings.whatsapp}
      paymentInstructions={settings.paymentInstructions}
      online={pays.online}
      offerAuto={offerAuto}
      billing={pays.billing}
      payResult={payResult}
    />
  )
}
