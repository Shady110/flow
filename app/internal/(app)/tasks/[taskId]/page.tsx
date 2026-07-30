import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ListTree } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { getCurrentUser } from '@/lib/auth/session'
import { getTask, getClients, getTeam } from '@/lib/db/queries'
import { TaskDialog } from '@/components/dashboard/TaskDialog'
import { TaskStatusSelect } from '@/components/dashboard/TaskStatusSelect'
import { ConfirmDelete } from '@/components/dashboard/ConfirmDelete'
import { deleteTaskAction } from '@/lib/db/task-actions'
import { SubtaskProgress } from '@/components/dashboard/SubtaskProgress'
import { TaskActivityTrail } from '@/components/dashboard/TaskActivityTrail'
import {
  DeadlineIndicator,
  PriorityLabel,
  TaskStatusBadge,
} from '@/components/dashboard/indicators'
import { Button } from '@/components/ds/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  )
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>
}) {
  const { taskId } = await params
  const [task, clients, team, user, t, tt, tc] = await Promise.all([
    getTask(taskId),
    getClients(),
    getTeam(),
    getCurrentUser(),
    getTranslations('internal.taskDetail'),
    getTranslations('internal.tasks'),
    getTranslations('internal.common'),
  ])
  if (!task) notFound()

  const clientOptions = clients.map((c) => ({ id: c.id, label: c.name }))
  const teamOptions = team.map((m) => ({ id: m.id, label: m.full_name ?? m.id }))
  const memberName = new Map(team.map((m) => [m.id, m.full_name ?? '—']))
  const clientName = clients.find((c) => c.id === task.client_id)?.name ?? '—'
  const canEdit = !!user?.permissions.has('tasks.edit')
  const canCreate = !!user?.permissions.has('tasks.create')
  const canDelete = !!user?.permissions.has('tasks.delete')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={task.parent ? `/tasks/${task.parent.id}` : '/tasks'}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {task.parent ? task.parent.title : t('backToTasks')}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <TaskStatusSelect taskId={task.id} clientId={task.client_id} status={task.status} />
          )}
          {canEdit && (
            <TaskDialog
              clients={clientOptions}
              team={teamOptions}
              fixedClientId={task.client_id}
              task={task}
              trigger={<Button variant="outline">{tc('edit')}</Button>}
            />
          )}
          {canDelete && (
            <ConfirmDelete
              action={deleteTaskAction}
              args={[task.id, task.client_id]}
              title={t('deleteTitle', { title: task.title })}
              description={
                task.subtask_total > 0
                  ? t('deleteWithSubtasks', { count: task.subtask_total })
                  : undefined
              }
              successMessage={t('taskDeleted')}
              redirectTo={task.parent ? `/tasks/${task.parent.id}` : '/tasks'}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{task.title}</CardTitle>
                  <Link
                    href={`/clients/${task.client_id}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {clientName}
                  </Link>
                </div>
                <TaskStatusBadge status={task.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {task.description && (
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {task.description}
                </p>
              )}
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                <Field label={tt('priority')}>
                  <PriorityLabel priority={task.priority} />
                </Field>
                <Field label={tt('due')}>
                  <DeadlineIndicator dueDate={task.due_date} status={task.status} />
                </Field>
                <Field label={t('start')}>
                  {task.start_date
                    ? new Date(task.start_date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—'}
                </Field>
                <Field label={t('stage')}>{task.stage || '—'}</Field>
                <Field label={t('nextStep')}>{task.next_step || '—'}</Field>
                <Field label={t('assignees')}>
                  {task.assignee_ids.length === 0
                    ? tc('unassigned')
                    : task.assignee_ids.map((id) => memberName.get(id) ?? '—').join(', ')}
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ListTree className="h-4 w-4" /> {t('subtasks')}
                {task.subtask_total > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    {task.subtask_done}/{task.subtask_total}
                  </span>
                )}
              </CardTitle>
              {canCreate && (
                <TaskDialog
                  clients={clientOptions}
                  team={teamOptions}
                  fixedClientId={task.client_id}
                  parentTaskId={task.id}
                  trigger={
                    <Button variant="outline" size="sm">
                      {t('addSubtask')}
                    </Button>
                  }
                />
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {task.subtask_total > 0 && (
                <SubtaskProgress done={task.subtask_done} total={task.subtask_total} />
              )}
              {task.subtasks.length === 0 && (
                <p className="text-sm text-muted-foreground">{t('noSubtasks')}</p>
              )}
              {task.subtasks.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0 space-y-1">
                    <Link href={`/tasks/${s.id}`} className="text-sm font-medium hover:underline">
                      {s.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {s.assignee_ids.length === 0
                        ? tc('unassigned')
                        : s.assignee_ids.map((id) => memberName.get(id) ?? '—').join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <DeadlineIndicator dueDate={s.due_date} status={s.status} />
                    {canEdit ? (
                      <TaskStatusSelect taskId={s.id} clientId={s.client_id} status={s.status} />
                    ) : (
                      <TaskStatusBadge status={s.status} />
                    )}
                    {canDelete && (
                      <ConfirmDelete
                        action={deleteTaskAction}
                        args={[s.id, s.client_id]}
                        title={t('deleteTitle', { title: s.title })}
                        successMessage={t('subtaskDeleted')}
                        compact
                      />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">{t('activity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskActivityTrail activity={task.activity} names={Object.fromEntries(memberName)} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
