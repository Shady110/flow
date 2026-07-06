import Link from 'next/link'
import { getClients, getTasks } from '@/lib/db/queries'
import { getCurrentUser } from '@/lib/auth/session'
import { deadlineState } from '@/lib/deadlines'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { NewClientDialog } from '@/components/dashboard/NewClientDialog'
import { ClientStatusBadge } from '@/components/dashboard/indicators'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ds/table'
import { Card } from '@/components/ds/card'

export default async function ClientsPage() {
  const [clients, tasks, user] = await Promise.all([getClients(), getTasks(), getCurrentUser()])
  const canCreate = !!user?.permissions.has('clients.create')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Every company we work with and the state of their engagement."
        actions={canCreate ? <NewClientDialog /> : undefined}
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Subdomain</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Open</TableHead>
              <TableHead className="text-right">Overdue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No clients yet.
                </TableCell>
              </TableRow>
            )}
            {clients.map((c) => {
              const ct = tasks.filter((t) => t.client_id === c.id)
              const open = ct.filter((t) => t.status !== 'done').length
              const overdue = ct.filter((t) => deadlineState(t) === 'overdue').length
              return (
                <TableRow key={c.id} className="cursor-pointer">
                  <TableCell className="font-medium">
                    <Link href={`/clients/${c.id}`} className="hover:underline">
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.slug}.flow…</TableCell>
                  <TableCell>
                    <ClientStatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="text-right">{open}</TableCell>
                  <TableCell className="text-right">
                    {overdue > 0 ? (
                      <span className="font-medium text-destructive">{overdue}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
