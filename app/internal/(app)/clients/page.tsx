import { getTranslations } from 'next-intl/server'
import { getClients, getTasks } from '@/lib/db/queries'
import { getCurrentUser, requirePermission } from '@/lib/auth/session'
import { deadlineState } from '@/lib/deadlines'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { NewClientDialog } from '@/components/dashboard/NewClientDialog'
import { ClientsTable, type ClientRow } from '@/components/dashboard/ClientsTable'
import { Card } from '@/components/ds/card'

export default async function ClientsPage() {
  await requirePermission('clients.view')
  const [clients, tasks, user, t] = await Promise.all([
    getClients(),
    getTasks(),
    getCurrentUser(),
    getTranslations('internal.clients'),
  ])
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
        title={t('title')}
        description={t('description')}
        actions={canCreate ? <NewClientDialog /> : undefined}
      />

      <Card className="p-0">
        <ClientsTable rows={rows} />
      </Card>
    </div>
  )
}
