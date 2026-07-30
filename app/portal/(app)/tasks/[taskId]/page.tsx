import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { requireClientContext } from '@/lib/auth/client-session'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import { TaskStatusBadge, DeadlineIndicator } from '@/components/dashboard/indicators'
import type { Task } from '@/lib/types'

/**
 * Read-only task view for the client. No assignees, no activity trail, no
 * controls — those are internal. RLS scopes the query to their own client, and
 * the client_id check below fails closed if a task from elsewhere is requested.
 */
export default async function PortalTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>
}) {
  const { client } = await requireClientContext()
  const { taskId } = await params
  const supabase = await createClient()
  const [t, tp, { data: task }, { data: children }] = await Promise.all([
    getTranslations('portal.taskDetail'),
    getTranslations('portal.tasks'),
    supabase.from('tasks').select('*').eq('id', taskId).maybeSingle(),
    supabase
      .from('tasks')
      .select('*')
      .eq('parent_task_id', taskId)
      .order('created_at', { ascending: true }),
  ])

  const row = task as Task | null
  if (!row || row.client_id !== client.id) notFound()

  const subtasks = (children as Task[]) ?? []
  const done = subtasks.filter((s) => s.status === 'done').length

  return (
    <div className="space-y-6">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('backToTasks')}
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle className="text-xl">{row.title}</CardTitle>
            <TaskStatusBadge status={row.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {row.description && (
            <p className="whitespace-pre-line text-sm text-muted-foreground">{row.description}</p>
          )}
          {row.next_step && (
            <p className="text-sm">{tp('next', { step: row.next_step })}</p>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t('due')}</span>
            <DeadlineIndicator dueDate={row.due_date} status={row.status} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {t('subtasks')}
            {subtasks.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                {t('progress', { done, total: subtasks.length })}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {subtasks.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('noSubtasks')}</p>
          )}
          {subtasks.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
            >
              <span className="text-sm font-medium">{s.title}</span>
              <div className="flex items-center gap-3">
                <DeadlineIndicator dueDate={s.due_date} status={s.status} />
                <TaskStatusBadge status={s.status} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
