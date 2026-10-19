import Link from 'next/link'
import { format } from 'date-fns'
import { getTranslations } from 'next-intl/server'
import { Plus } from 'lucide-react'
import { requirePermission } from '@/lib/auth/session'
import { getClients } from '@/lib/db/queries'
import { getContracts } from '@/lib/db/contract-queries'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ContractStatusBadge } from '@/components/contracts/ContractStatusBadge'
import { Button } from '@/components/ds/button'
import { Card } from '@/components/ds/card'
import { LinkedTableRow } from '@/components/dashboard/LinkedTableRow'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ds/table'

export default async function ContractsPage() {
  await requirePermission('contracts.manage')
  const [contracts, clients, t] = await Promise.all([
    getContracts(),
    getClients(),
    getTranslations('internal.contracts'),
  ])
  const clientName = new Map(clients.map((c) => [c.id, c.name]))

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <>
            <Button variant="outline" asChild><Link href="/contracts/templates">{t('templates')}</Link></Button>
            <Button asChild><Link href="/contracts/new"><Plus className="h-4 w-4" /> {t('newContract')}</Link></Button>
          </>
        }
      />
      {contracts.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('client')}</TableHead>
                <TableHead>{t('contractTitle')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('sentOn')}</TableHead>
                <TableHead>{t('acceptedOn')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((c) => (
                <LinkedTableRow key={c.id} href={`/contracts/${c.id}`}>
                  <TableCell className="font-medium">{clientName.get(c.client_id) ?? '—'}</TableCell>
                  <TableCell>{c.title}</TableCell>
                  <TableCell><ContractStatusBadge status={c.status} label={t(`status_${c.status}`)} /></TableCell>
                  <TableCell>{c.sent_at ? format(new Date(c.sent_at), 'PP') : '—'}</TableCell>
                  <TableCell>{c.accepted_at ? format(new Date(c.accepted_at), 'PP') : '—'}</TableCell>
                </LinkedTableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
