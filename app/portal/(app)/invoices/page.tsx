import { requireClientContext } from '@/lib/auth/client-session'
import { getInvoices } from '@/lib/db/finance-queries'
import { getPortalSettings } from '@/lib/db/portal-settings'
import { InvoicesView } from '@/components/portal/InvoicesView'

export default async function PortalInvoices() {
  const { client } = await requireClientContext()
  const [all, settings] = await Promise.all([getInvoices(client.id), getPortalSettings()])
  // Drafts are ours; voided invoices are not the client's business.
  const invoices = all.filter((i) => i.status === 'sent' || i.status === 'paid')
  return <InvoicesView invoices={invoices} whatsapp={settings.whatsapp} paymentInstructions={settings.paymentInstructions} />
}
