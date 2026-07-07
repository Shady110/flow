import { getClients, getTasks } from '@/lib/db/queries'
import { getCurrentUser } from '@/lib/auth/session'
import { deadlineState } from '@/lib/deadlines'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { NewClientDialog } from '@/components/dashboard/NewClientDialog'
import { ClientsTable, type ClientRow } from '@/components/dashboard/ClientsTable'
import { Card } from '@/components/ds/card'

export default async function ClientsPage() {
  const [clients, tasks, user] = await Promise.all([getClients(), getTasks(), getCurrentUser()])
  const canCreate = !!user?.permissions.has('clients.create')

  const rows: ClientRow[] = clients.map((c) => {
    const ct = tasks.filter((t) => t.client_id === c.id)
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      status: c.status,
      open: ct.filter((t) => t.status !== 'done').length,
      overdue: ct.filter((t) => deadlineState(t) === 'overdue').length,
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Every company we work with and the state of their engagement."
        actions={canCreate ? <NewClientDialog /> : undefined}
      />

      <Card className="p-0">
        <ClientsTable rows={rows} />
      </Card>
    </div>
  )
}
