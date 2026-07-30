'use client'

import { useTranslations } from 'next-intl'
import { ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ds/table'
import { ClientStatusBadge } from '@/components/dashboard/indicators'
import { LinkedTableRow } from '@/components/dashboard/LinkedTableRow'
import type { ClientStatus } from '@/lib/types'

export interface ClientRow {
  id: string
  name: string
  slug: string
  status: ClientStatus
  open: number
  overdue: number
}

export function ClientsTable({ rows }: { rows: ClientRow[] }) {
  const t = useTranslations('internal.clients')

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('client')}</TableHead>
          <TableHead>{t('subdomain')}</TableHead>
          <TableHead>{t('status')}</TableHead>
          <TableHead className="text-end">{t('open')}</TableHead>
          <TableHead className="text-end">{t('overdue')}</TableHead>
          <TableHead className="w-8" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
              {t('noClients')}
            </TableCell>
          </TableRow>
        )}
        {rows.map((c) => (
          <LinkedTableRow key={c.id} href={`/clients/${c.id}`}>
            <TableCell className="font-medium">{c.name}</TableCell>
            <TableCell className="text-muted-foreground">{c.slug}.flow…</TableCell>
            <TableCell>
              <ClientStatusBadge status={c.status} />
            </TableCell>
            <TableCell className="text-end">{c.open}</TableCell>
            <TableCell className="text-end">
              {c.overdue > 0 ? (
                <span className="font-medium text-destructive">{c.overdue}</span>
              ) : (
                <span className="text-muted-foreground">0</span>
              )}
            </TableCell>
            <TableCell className="text-end text-muted-foreground">
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </TableCell>
          </LinkedTableRow>
        ))}
      </TableBody>
    </Table>
  )
}
