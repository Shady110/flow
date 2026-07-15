import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { requireClientContext } from '@/lib/auth/client-session'
import { getInvoices } from '@/lib/db/finance-queries'
import { formatMoney } from '@/lib/money'
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
  const t = await getTranslations('portal.invoices')
  const invoices = (await getInvoices(client.id)).filter((i) => i.status !== 'draft')

  const outstanding = invoices.reduce((s, i) => s + i.balance, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {outstanding > 0
            ? t('outstanding', { amount: formatMoney(outstanding) })
            : t('paidUp')}
        </p>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('invoice')}</TableHead>
              <TableHead className="text-end">{t('total')}</TableHead>
              <TableHead className="text-end">{t('balance')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                  {t('noInvoices')}
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
                <TableCell className="text-end">{formatMoney(i.total, i.currency)}</TableCell>
                <TableCell className="text-end">
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
