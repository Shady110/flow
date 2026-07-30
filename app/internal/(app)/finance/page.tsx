import { getTranslations } from 'next-intl/server'
import { TrendingUp, Calendar, AlertCircle, PiggyBank } from 'lucide-react'
import { requirePermission, getCurrentUser } from '@/lib/auth/session'
import { getClients } from '@/lib/db/queries'
import { getFinanceSummary, getInvoices, getPayments, getExpenses } from '@/lib/db/finance-queries'
import { deletePaymentAction, deleteExpenseAction } from '@/lib/db/finance-actions'
import { formatMoney } from '@/lib/money'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { GroupedBars } from '@/components/dashboard/charts'
import { InvoiceStatusBadge } from '@/components/dashboard/indicators'
import { LinkedTableRow } from '@/components/dashboard/LinkedTableRow'
import { NewInvoiceDialog } from '@/components/dashboard/NewInvoiceDialog'
import { RecordPaymentDialog } from '@/components/dashboard/RecordPaymentDialog'
import { AddExpenseDialog } from '@/components/dashboard/AddExpenseDialog'
import { ConfirmDelete } from '@/components/dashboard/ConfirmDelete'
import { Button } from '@/components/ds/button'
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
  const [summary, invoices, payments, expenses, clients, user, t] = await Promise.all([
    getFinanceSummary(),
    getInvoices(),
    getPayments(),
    getExpenses(),
    getClients(),
    getCurrentUser(),
    getTranslations('internal.finance'),
  ])

  const canIssue = !!user?.permissions.has('invoices.issue')
  const canManage = !!user?.permissions.has('finance.manage')
  const clientOptions = clients.map((c) => ({ id: c.id, label: c.name }))
  const invoiceOptions = invoices
    .filter((i) => i.balance > 0 && i.status !== 'void')
    .map((i) => ({ id: i.id, client_id: i.client_id, label: `${i.number} · ${formatMoney(i.balance, i.currency)} ${t('due')}` }))
  // Editing an existing payment may need to point at an already-settled invoice.
  const allInvoiceOptions = invoices.map((i) => ({
    id: i.id,
    client_id: i.client_id,
    label: `${i.number} · ${formatMoney(i.total, i.currency)}`,
  }))

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canManage && <AddExpenseDialog clients={clientOptions} />}
            {canManage && <RecordPaymentDialog clients={clientOptions} invoices={invoiceOptions} />}
            {canIssue && clients.length > 0 && <NewInvoiceDialog clients={clientOptions} />}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('revenueAllTime')} value={formatMoney(summary.revenue, summary.currency)} icon={TrendingUp} />
        <StatCard label={t('thisMonth')} value={formatMoney(summary.revenueThisMonth, summary.currency)} icon={Calendar} />
        <StatCard
          label={t('outstanding')}
          value={formatMoney(summary.outstanding, summary.currency)}
          icon={AlertCircle}
          tone={summary.outstanding > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label={t('profit')}
          value={formatMoney(summary.profit, summary.currency)}
          icon={PiggyBank}
          hint={t('expenses', { amount: formatMoney(summary.expensesTotal, summary.currency) })}
          tone={summary.profit >= 0 ? 'success' : 'danger'}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('revenueVsExpenses')}</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupedBars
            data={summary.monthly}
            bars={[
              { key: 'Revenue', color: 'var(--chart-1)', label: t('revenue') },
              { key: 'Expenses', color: 'var(--chart-5)', label: t('expensesLabel') },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('invoices')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('invoice')}</TableHead>
                <TableHead>{t('client')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead className="text-end">{t('total')}</TableHead>
                <TableHead className="text-end">{t('balance')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    {t('noInvoices')}
                  </TableCell>
                </TableRow>
              )}
              {invoices.map((i) => (
                <LinkedTableRow key={i.id} href={`/finance/invoices/${i.id}`}>
                  <TableCell className="font-medium">{i.number}</TableCell>
                  <TableCell className="text-muted-foreground">{i.client_name}</TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={i.status} />
                  </TableCell>
                  <TableCell className="text-end">{formatMoney(i.total, i.currency)}</TableCell>
                  <TableCell className="text-end">
                    {i.balance > 0 ? (
                      <span className="font-medium text-warning">{formatMoney(i.balance, i.currency)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </LinkedTableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('recentPayments')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">{t('noPayments')}</p>
          ) : (
            <ul className="divide-y divide-border">
              {payments.slice(0, 8).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-6 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{formatMoney(Number(p.amount))}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.invoice_number ?? t('unlinked')} · {p.method ?? '—'} ·{' '}
                      {new Date(p.paid_at).toLocaleDateString()}
                    </p>
                  </div>
                  {canManage && (
                    <div className="flex shrink-0 items-center gap-1">
                      <RecordPaymentDialog
                        clients={clientOptions}
                        invoices={allInvoiceOptions}
                        payment={p}
                        trigger={
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        }
                      />
                      <ConfirmDelete
                        action={deletePaymentAction}
                        args={[p.id]}
                        title={`Delete this ${formatMoney(Number(p.amount))} payment?`}
                        description="The invoice it was applied to goes back to unpaid if it no longer covers the total."
                        successMessage="Payment deleted"
                        compact
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expenses</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {expenses.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">No expenses recorded.</p>
          ) : (
            <ul className="divide-y divide-border">
              {expenses.slice(0, 8).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 px-6 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{formatMoney(Number(e.amount))}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[e.category, e.description].filter(Boolean).join(' · ') || '—'} ·{' '}
                      {new Date(e.incurred_on).toLocaleDateString()}
                    </p>
                  </div>
                  {canManage && (
                    <div className="flex shrink-0 items-center gap-1">
                      <AddExpenseDialog
                        clients={clientOptions}
                        expense={e}
                        trigger={
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        }
                      />
                      <ConfirmDelete
                        action={deleteExpenseAction}
                        args={[e.id]}
                        title={`Delete this ${formatMoney(Number(e.amount))} expense?`}
                        successMessage="Expense deleted"
                        compact
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
