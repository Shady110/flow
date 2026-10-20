import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react'
import { requireClientContext } from '@/lib/auth/client-session'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/format'
import { HatchBar } from '@/components/dashboard/HatchBar'
import type { Task } from '@/lib/types'

/**
 * Read-only task view for the client. No assignees, no activity trail, no
 * controls — those are internal. RLS scopes the query to their own client, and
 * the client_id check below fails closed if a task from elsewhere is requested.
 */
export default async function PortalTaskPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { client } = await requireClientContext()
  const { taskId } = await params
  const supabase = await createClient()
  const [t, tp, locale, { data: task }, { data: children }] = await Promise.all([
    getTranslations('portal.taskDetail'),
    getTranslations('portal.plain'),
    getLocale(),
    supabase.from('tasks').select('*').eq('id', taskId).maybeSingle(),
    supabase.from('tasks').select('*').eq('parent_task_id', taskId).order('created_at', { ascending: true }),
  ])

  const row = task as Task | null
  if (!row || row.client_id !== client.id) notFound()

  const subtasks = (children as Task[]) ?? []
  const done = subtasks.filter((s) => s.status === 'done').length

  return (
    <div className="space-y-6">
      <Link href="/tasks" className="inline-flex min-h-11 items-center gap-2 text-base font-medium text-[var(--brand-ink)]">
        <ArrowLeft className="h-5 w-5 rtl:rotate-180" /> {t('backToTasks')}
      </Link>

      <div className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">{row.title}</h1>
        <p className="inline-block rounded-full bg-muted px-4 py-1.5 text-base font-semibold">{tp(`task.${row.status}`)}</p>
        {row.due_date && <p className="text-base text-muted-foreground">{tp('dueOn', { date: formatDate(row.due_date, locale) })}</p>}
      </div>

      {row.description && <p className="whitespace-pre-line rounded-3xl bg-muted/50 p-4 text-base leading-relaxed">{row.description}</p>}
      {row.next_step && (
        <div className="rounded-3xl bg-[var(--brand)]/10 p-4">
          <p className="text-sm font-medium text-muted-foreground">{tp('nextStepLabel')}</p>
          <p className="mt-1 text-lg font-semibold">{row.next_step}</p>
        </div>
      )}

      {subtasks.length > 0 && (
        <section className="space-y-3 rounded-3xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold">{t('subtasks')}</h2>
            <span className="text-sm text-muted-foreground">{tp('stepsDone', { done, total: subtasks.length })}</span>
          </div>
          <HatchBar value={done} max={subtasks.length} />
          <ul className="space-y-3 pt-1">
            {subtasks.map((s) => (
              <li key={s.id} className="flex items-start gap-3">
                {s.status === 'done' ? <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-flow-green" /> : <Circle className="mt-0.5 h-6 w-6 shrink-0 text-muted-foreground" />}
                <span className={s.status === 'done' ? 'text-base text-muted-foreground line-through' : 'text-base'}>{s.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
