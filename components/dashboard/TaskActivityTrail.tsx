import { TASK_STATUS_LABELS } from '@/lib/constants'
import type { TaskActivity, TaskStatus } from '@/lib/types'

function label(status: unknown) {
  return typeof status === 'string' && status in TASK_STATUS_LABELS
    ? TASK_STATUS_LABELS[status as TaskStatus]
    : String(status ?? '—')
}

/** Renders the task_activity rows the app has been recording since day one. */
export function TaskActivityTrail({
  activity,
  names,
}: {
  activity: TaskActivity[]
  names: Record<string, string>
}) {
  if (activity.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>
  }

  return (
    <ol className="space-y-4">
      {activity.map((a) => {
        const detail = a.detail ?? {}
        const who = a.actor_id ? (names[a.actor_id] ?? 'Someone') : 'System'
        return (
          <li key={a.id} className="flex gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-flow-lime" />
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm">
                {a.action === 'status_changed' ? (
                  <>
                    {who} moved this to <span className="font-medium">{label(detail.to)}</span>
                    <span className="text-muted-foreground"> from {label(detail.from)}</span>
                  </>
                ) : a.action === 'created' ? (
                  <>
                    {who} created this task
                    {typeof detail.subtasks === 'number' && detail.subtasks > 0
                      ? ` with ${detail.subtasks} subtask${detail.subtasks === 1 ? '' : 's'}`
                      : ''}
                  </>
                ) : (
                  <>
                    {who} — {a.action}
                  </>
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
