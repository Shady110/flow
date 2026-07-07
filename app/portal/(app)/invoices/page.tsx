import Link from 'next/link'
import { requireClientContext } from '@/lib/auth/client-session'
import { getInvoices } from '@/lib/db/finance-queries'
import { formatMoney } from '@/lib/money'
import { InvoiceStatusBadge } from '@/components/dashboard/indicators'
import { Card } from '@/components/ds/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ds/table'

export default async function PortalInvoices() {
  const { client } = await requireClientContext()
  const invoices = (await getInvoices(client.id)).filter((i) => i.status !== 'draft')

  const outstanding = invoices.reduce((s, i) => s + i.balance, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Invoices</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {outstanding > 0
            ? `You have ${formatMoney(outstanding)} outstanding.`
            : 'You’re all paid up. Thank you!'}
        </p>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Issued</TableHead>
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
                  <Link href={`/invoices/${i.id}`} className="hover:underline">
                    {i.number}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(i.issue_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={i.status} />
                </TableCell>
                <TableCell className="text-right">{formatMoney(i.total, i.currency)}</TableCell>
                <TableCell className="text-right">
                  {i.balance > 0 ? (
                    <span className="font-medium text-warning">{formatMoney(i.balance, i.currency)}</span>
                  ) : (
                    '—'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
