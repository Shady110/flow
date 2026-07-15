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
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('client_id', client.id)
    .order('due_date', { ascending: true, nullsFirst: false })
  const tasks = (data as Task[]) ?? []

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
                  <p className="font-medium">{task.title}</p>
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
