import Link from 'next/link'
import { TrendingUp, Calendar, AlertCircle, PiggyBank } from 'lucide-react'
import { requirePermission, getCurrentUser } from '@/lib/auth/session'
import { getClients } from '@/lib/db/queries'
import { getFinanceSummary, getInvoices, getPayments } from '@/lib/db/finance-queries'
import { formatMoney } from '@/lib/money'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { GroupedBars } from '@/components/dashboard/charts'
import { InvoiceStatusBadge } from '@/components/dashboard/indicators'
import { NewInvoiceDialog } from '@/components/dashboard/NewInvoiceDialog'
import { RecordPaymentDialog } from '@/components/dashboard/RecordPaymentDialog'
import { AddExpenseDialog } from '@/components/dashboard/AddExpenseDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ds/table'

export default async function FinancePage() {
  await requirePermission('finance.view')
  const [summary, invoices, payments, clients, user] = await Promise.all([
    getFinanceSummary(),
    getInvoices(),
    getPayments(),
    getClients(),
    getCurrentUser(),
  ])

  const canIssue = !!user?.permissions.has('invoices.issue')
  const canManage = !!user?.permissions.has('finance.manage')
  const clientOptions = clients.map((c) => ({ id: c.id, label: c.name }))
  const invoiceOptions = invoices
    .filter((i) => i.balance > 0 && i.status !== 'void')
    .map((i) => ({ id: i.id, client_id: i.client_id, label: `${i.number} · ${formatMoney(i.balance, i.currency)} due` }))

  return (
    <div className="space-y-8">
      <PageHeader
        title="Finance"
        description="Revenue, outstanding balances and profitability."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canManage && <AddExpenseDialog clients={clientOptions} />}
            {canManage && <RecordPaymentDialog clients={clientOptions} invoices={invoiceOptions} />}
            {canIssue && clients.length > 0 && <NewInvoiceDialog clients={clientOptions} />}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue (all time)" value={formatMoney(summary.revenue, summary.currency)} icon={TrendingUp} />
        <StatCard label="This month" value={formatMoney(summary.revenueThisMonth, summary.currency)} icon={Calendar} />
        <StatCard
          label="Outstanding"
          value={formatMoney(summary.outstanding, summary.currency)}
          icon={AlertCircle}
          tone={summary.outstanding > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Profit"
          value={formatMoney(summary.profit, summary.currency)}
          icon={PiggyBank}
          hint={`Expenses ${formatMoney(summary.expensesTotal, summary.currency)}`}
          tone={summary.profit >= 0 ? 'success' : 'danger'}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue vs expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupedBars
            data={summary.monthly}
            bars={[
              { key: 'Revenue', color: 'var(--chart-1)', label: 'Revenue' },
              { key: 'Expenses', color: 'var(--chart-5)', label: 'Expenses' },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No invoices yet.
                  </TableCell>
                </TableRow>
              )}
              {invoices.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">
                    <Link href={`/finance/invoices/${i.id}`} className="hover:underline">
                      {i.number}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{i.client_name}</TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={i.status} />
                  </TableCell>
                  <TableCell className="text-right">{formatMoney(i.total, i.currency)}</TableCell>
                  <TableCell className="text-right">
                    {i.balance > 0 ? (
                      <span className="font-medium text-warning">{formatMoney(i.balance, i.currency)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {payments.slice(0, 8).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-6 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{formatMoney(Number(p.amount))}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.invoice_number ?? 'Unlinked'} · {p.method ?? '—'} ·{' '}
                      {new Date(p.paid_at).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
