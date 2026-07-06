import { notFound } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { getClient, getTasks, getTeam } from '@/lib/db/queries'
import { getCurrentUser } from '@/lib/auth/session'
import { deadlineState } from '@/lib/deadlines'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TaskDialog } from '@/components/dashboard/TaskDialog'
import { TaskStatusSelect } from '@/components/dashboard/TaskStatusSelect'
import {
  ClientStatusBadge,
  DeadlineIndicator,
  PriorityLabel,
} from '@/components/dashboard/indicators'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import { Button } from '@/components/ds/button'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const [client, tasks, team, user] = await Promise.all([
    getClient(clientId),
    getTasks(clientId),
    getTeam(),
    getCurrentUser(),
  ])
  if (!client) notFound()

  const memberName = new Map(team.map((m) => [m.id, m.full_name ?? '—']))
  const canCreateTask = !!user?.permissions.has('tasks.create')
  const canEditTask = !!user?.permissions.has('tasks.edit')

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000'
  const portalProtocol = rootDomain.includes('localhost') ? 'http' : 'https'
  const portalUrl = `${portalProtocol}://${client.slug}.${rootDomain}`

  const open = tasks.filter((t) => t.status !== 'done')
  const overdue = open.filter((t) => deadlineState(t) === 'overdue').length
  const clientOptions = [{ id: client.id, label: client.name }]
  const teamOptions = team.map((m) => ({ id: m.id, label: m.full_name ?? m.id }))

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.name}
        description={`${client.slug}.flow…`}
        actions={
          canCreateTask ? (
            <TaskDialog clients={clientOptions} team={teamOptions} fixedClientId={client.id} />
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <ClientStatusBadge status={client.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Open tasks</p>
            <p className="mt-1 font-display text-xl font-bold">{open.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Overdue</p>
            <p className={`mt-1 font-display text-xl font-bold ${overdue ? 'text-destructive' : ''}`}>{overdue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Portal</p>
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-flow-green"
            >
              Visit <ArrowUpRight className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions &amp; tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.length === 0 && (
            <p className="text-sm text-muted-foreground">No tasks yet for this client.</p>
          )}
          {tasks.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{t.title}</span>
                  <PriorityLabel priority={t.priority} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.next_step ? `Next: ${t.next_step}` : t.stage ?? 'No next step set'}
                  {' · '}
                  {memberName.get(t.assignee_id ?? '') ?? 'Unassigned'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <DeadlineIndicator dueDate={t.due_date} status={t.status} />
                {canEditTask ? (
                  <TaskStatusSelect taskId={t.id} clientId={client.id} status={t.status} />
                ) : null}
                {canEditTask && (
                  <TaskDialog
                    clients={clientOptions}
                    team={teamOptions}
                    fixedClientId={client.id}
                    task={t}
                    trigger={
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
