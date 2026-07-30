import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { requireClientContext } from '@/lib/auth/client-session'
import { createClient } from '@/lib/supabase/server'
import type { Task } from '@/lib/types'
import { Card, CardContent } from '@/components/ds/card'
import { TaskStatusBadge, DeadlineIndicator } from '@/components/dashboard/indicators'

export default async function PortalTasks() {
  const { client } = await requireClientContext()
  const t = await getTranslations('portal.tasks')
  const supabase = await createClient()
  // Top-level tasks only — the subtask breakdown lives on the task's own page.
  const [{ data }, { data: allRows }] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('client_id', client.id)
      .is('parent_task_id', null)
      .order('due_date', { ascending: true, nullsFirst: false }),
    supabase
      .from('tasks')
      .select('parent_task_id, status')
      .eq('client_id', client.id)
      .not('parent_task_id', 'is', null),
  ])
  const tasks = (data as Task[]) ?? []
  const children = (allRows as { parent_task_id: string; status: string }[]) ?? []
  const progress = (id: string) => {
    const mine = children.filter((c) => c.parent_task_id === id)
    return mine.length ? { done: mine.filter((c) => c.status === 'done').length, total: mine.length } : null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('noTasks')}</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/tasks/${task.id}`} className="font-medium hover:underline">
                    {task.title}
                  </Link>
                  {progress(task.id) && (
                    <span className="ms-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {progress(task.id)!.done}/{progress(task.id)!.total}
                    </span>
                  )}
                  {task.next_step && <p className="text-xs text-muted-foreground">{t('next', { step: task.next_step })}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <DeadlineIndicator dueDate={task.due_date} status={task.status} />
                  <TaskStatusBadge status={task.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
