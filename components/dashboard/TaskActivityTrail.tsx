import { getTranslations } from 'next-intl/server'
import type { TaskActivity, TaskStatus } from '@/lib/types'

const TASK_STATUSES = ['todo', 'in_progress', 'blocked', 'review', 'done']

/** Renders the task_activity rows the app has been recording since day one. */
export async function TaskActivityTrail({
  activity,
  names,
}: {
  activity: TaskActivity[]
  names: Record<string, string>
}) {
  const t = await getTranslations('internal.taskDetail')
  const ts = await getTranslations('internal.status')

  // Fall back to the raw value for anything not a known status.
  const label = (v: unknown) =>
    typeof v === 'string' && TASK_STATUSES.includes(v) ? ts(v as TaskStatus) : String(v ?? '—')

  if (activity.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('noActivity')}</p>
  }

  return (
    <ol className="space-y-4">
      {activity.map((a) => {
        const detail = a.detail ?? {}
        const who = a.actor_id ? (names[a.actor_id] ?? t('someone')) : t('system')
        const subtasks = typeof detail.subtasks === 'number' ? detail.subtasks : 0
        return (
          <li key={a.id} className="flex gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-flow-lime" />
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm">
                {a.action === 'status_changed' ? (
                  <>
                    {t('actStatusChanged', {
                      who: detail.auto ? t('actAuto') : who,
                      to: label(detail.to),
                    })}{' '}
                    <span className="text-muted-foreground">
                      {t('actFrom', { from: label(detail.from) })}
                    </span>
                  </>
                ) : a.action === 'assignees_changed' ? (
                  t('actAssignees', { who })
                ) : a.action === 'edited' ? (
                  t('actEdited', {
                    who,
                    fields: Array.isArray(detail.fields) ? detail.fields.join(', ') : '—',
                  })
                ) : a.action === 'created' ? (
                  subtasks > 0
                    ? t('actCreatedWithSubtasks', { who, count: subtasks })
                    : t('actCreated', { who })
                ) : (
                  t('actOther', { who, action: a.action })
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(a.created_at).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
