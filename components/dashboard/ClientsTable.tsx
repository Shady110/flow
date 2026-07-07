'use client'

import { useRouter } from 'next/navigation'
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
  const router = useRouter()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Subdomain</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Open</TableHead>
          <TableHead className="text-right">Overdue</TableHead>
          <TableHead className="w-8" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
              No clients yet.
            </TableCell>
          </TableRow>
        )}
        {rows.map((c) => (
          <TableRow
            key={c.id}
            onClick={() => router.push(`/clients/${c.id}`)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') router.push(`/clients/${c.id}`)
            }}
            className="cursor-pointer focus:bg-muted/50 focus:outline-none"
          >
            <TableCell className="font-medium">{c.name}</TableCell>
            <TableCell className="text-muted-foreground">{c.slug}.flow…</TableCell>
            <TableCell>
              <ClientStatusBadge status={c.status} />
            </TableCell>
            <TableCell className="text-right">{c.open}</TableCell>
            <TableCell className="text-right">
              {c.overdue > 0 ? (
                <span className="font-medium text-destructive">{c.overdue}</span>
              ) : (
                <span className="text-muted-foreground">0</span>
              )}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              <ChevronRight className="h-4 w-4" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
