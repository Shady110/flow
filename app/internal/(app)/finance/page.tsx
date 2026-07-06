import { Wallet } from 'lucide-react'
import { requirePermission } from '@/lib/auth/session'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ComingSoon } from '@/components/dashboard/ComingSoon'

export default async function FinancePage() {
  await requirePermission('finance.view')
  return (
    <div className="space-y-6">
      <PageHeader title="Finance" description="Payments, invoices and profitability." />
      <ComingSoon
        icon={Wallet}
        title="Payment & invoice tracking"
        description="Track balances per client and per ticket, see profit by month and date range, and print branded invoices."
        phase="Phase 4"
      />
    </div>
  )
}
