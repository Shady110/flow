import Link from 'next/link'
import { Users, ListChecks, AlertTriangle, Clock } from 'lucide-react'
import { getClients, getTasks, getTeam } from '@/lib/db/queries'
import { deadlineState } from '@/lib/deadlines'
import { TASK_STATUS_LABELS, type TaskStatus } from '@/lib/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusDonut } from '@/components/dashboard/charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import { ClientStatusBadge, DeadlineIndicator } from '@/components/dashboard/indicators'

export default async function OverviewPage() {
  const [clients, tasks, team] = await Promise.all([getClients(), getTasks(), getTeam()])

  const clientName = new Map(clients.map((c) => [c.id, c.name]))
  const memberName = new Map(team.map((m) => [m.id, m.full_name ?? '—']))

  const activeClients = clients.filter((c) => c.status === 'active').length
  const openTasks = tasks.filter((t) => t.status !== 'done')
  const overdue = openTasks.filter((t) => deadlineState(t) === 'overdue')
  const dueSoon = openTasks.filter((t) => deadlineState(t) === 'due_soon')

  const statusCounts = (Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => ({
    label: TASK_STATUS_LABELS[s],
    value: tasks.filter((t) => t.status === s).length,
  }))

  const atRisk = [...overdue, ...dueSoon].slice(0, 8)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Business overview"
        description="Live snapshot across every client and every active task."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active clients" value={activeClients} icon={Users} hint={`${clients.length} total`} />
        <StatCard label="Open tasks" value={openTasks.length} icon={ListChecks} />
        <StatCard label="Overdue" value={overdue.length} icon={AlertTriangle} tone={overdue.length ? 'danger' : 'default'} />
        <StatCard label="Due soon" value={dueSoon.length} icon={Clock} tone={dueSoon.length ? 'warning' : 'default'} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Task status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDonut data={statusCounts} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Needs attention</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {atRisk.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-muted-foreground">
                Nothing overdue or due soon. 🎉
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {atRisk.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-4 px-6 py-3">
                    <div className="min-w-0">
                      <Link href={`/clients/${t.client_id}`} className="truncate text-sm font-medium hover:underline">
                        {t.title}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {clientName.get(t.client_id)} · {memberName.get(t.assignee_id ?? '') ?? 'Unassigned'}
                      </p>
                    </div>
                    <DeadlineIndicator dueDate={t.due_date} status={t.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-foreground">Clients</h2>
        {clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No clients yet. Add your first client to start tracking work.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((c) => {
              const clientTasks = tasks.filter((t) => t.client_id === c.id)
              const clientOverdue = clientTasks.filter((t) => deadlineState(t) === 'overdue').length
              return (
                <Link key={c.id} href={`/clients/${c.id}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium text-foreground">{c.name}</span>
                        <ClientStatusBadge status={c.status} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{clientTasks.filter((t) => t.status !== 'done').length} open tasks</span>
                        {clientOverdue > 0 && (
                          <span className="font-medium text-destructive">{clientOverdue} overdue</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
