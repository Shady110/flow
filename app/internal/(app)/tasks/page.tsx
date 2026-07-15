import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getClients, getTasks, getTeam } from '@/lib/db/queries'
import { getCurrentUser } from '@/lib/auth/session'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TaskDialog } from '@/components/dashboard/TaskDialog'
import { TaskStatusSelect } from '@/components/dashboard/TaskStatusSelect'
import { DeadlineIndicator, PriorityLabel, TaskStatusBadge } from '@/components/dashboard/indicators'
import { Card } from '@/components/ds/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ds/table'

export default async function TasksPage() {
  const [clients, tasks, team, user, tr, tc] = await Promise.all([
    getClients(),
    getTasks(),
    getTeam(),
    getCurrentUser(),
    getTranslations('internal.tasks'),
    getTranslations('internal.common'),
  ])

  const clientOptions = clients.map((c) => ({ id: c.id, label: c.name }))
  const teamOptions = team.map((m) => ({ id: m.id, label: m.full_name ?? m.id }))
  const clientName = new Map(clients.map((c) => [c.id, c.name]))
  const memberName = new Map(team.map((m) => [m.id, m.full_name ?? '—']))
  const canCreate = !!user?.permissions.has('tasks.create')
  const canEdit = !!user?.permissions.has('tasks.edit')

  return (
    <div className="space-y-6">
      <PageHeader
        title={tr('title')}
        description={tr('description')}
        actions={
          canCreate && clients.length > 0 ? (
            <TaskDialog clients={clientOptions} team={teamOptions} />
          ) : undefined
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tr('task')}</TableHead>
              <TableHead>{tr('client')}</TableHead>
              <TableHead>{tr('owner')}</TableHead>
              <TableHead>{tr('priority')}</TableHead>
              <TableHead>{tr('due')}</TableHead>
              <TableHead>{tr('status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  {tr('noTasks')}
                </TableCell>
              </TableRow>
            )}
            {tasks.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.title}</TableCell>
                <TableCell>
                  <Link href={`/clients/${t.client_id}`} className="text-muted-foreground hover:underline">
                    {clientName.get(t.client_id)}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {memberName.get(t.assignee_id ?? '') ?? tc('unassigned')}
                </TableCell>
                <TableCell>
                  <PriorityLabel priority={t.priority} />
                </TableCell>
                <TableCell>
                  <DeadlineIndicator dueDate={t.due_date} status={t.status} />
                </TableCell>
                <TableCell>
                  {canEdit ? (
                    <TaskStatusSelect taskId={t.id} clientId={t.client_id} status={t.status} />
                  ) : (
                    <TaskStatusBadge status={t.status} />
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
