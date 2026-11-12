import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { ChevronRight, ListChecks } from 'lucide-react'
import { requireClientContext } from '@/lib/auth/client-session'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/format'
import type { Task, TaskStatus } from '@/lib/types'
import { HatchBar } from '@/components/dashboard/HatchBar'
import { cn } from '@/lib/utils'

const CHIP: Record<TaskStatus, string> = {
  todo: 'bg-muted text-muted-foreground',
  in_progress: 'bg-sky-100 text-sky-900',
  blocked: 'bg-amber-100 text-amber-900',
  review: 'bg-flow-lime/40 text-flow-green',
  done: 'bg-flow-lime/60 text-flow-green',
}

/** "What we're doing for you": plain cards, whole card tappable, no internal vocabulary. */
export default async function PortalTasks() {
  const { client } = await requireClientContext()
  const [t, tp, locale] = await Promise.all([getTranslations('portal.tasks'), getTranslations('portal.plain'), getLocale()])
  const supabase = await createClient()
  // Top-level tasks only — the step-by-step breakdown lives on the task's own page.
  const [{ data }, { data: allRows }] = await Promise.all([
    supabase.from('tasks').select('*').eq('client_id', client.id).is('parent_task_id', null).order('due_date', { ascending: true, nullsFirst: false }),
    supabase.from('tasks').select('parent_task_id, status').eq('client_id', client.id).not('parent_task_id', 'is', null),
  ])
  const tasks = (data as Task[]) ?? []
  const children = (allRows as { parent_task_id: string; status: string }[]) ?? []
  const progress = (id: string) => {
    const mine = children.filter((c) => c.parent_task_id === id)
    return mine.length ? { done: mine.filter((c) => c.status === 'done').length, total: mine.length } : null
  }

  const active = tasks.filter((x) => x.status !== 'done')
  const done = tasks.filter((x) => x.status === 'done')

  const card = (task: Task) => {
    const pr = progress(task.id)
    return (
      <li key={task.id}>
        <Link href={`/tasks/${task.id}`} className="block space-y-3 rounded-3xl border border-border/60 bg-card p-4 shadow-[var(--shadow-xs)] transition-shadow hover:shadow-[var(--shadow-md)] sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-lg font-semibold leading-snug">{task.title}</p>
            <span className={cn('shrink-0 rounded-full px-3 py-1 text-sm font-semibold', CHIP[task.status])}>{tp(`task.${task.status}`)}</span>
          </div>
          {task.next_step && <p className="text-base text-muted-foreground">{t('next', { step: task.next_step })}</p>}
          {pr && (
            <div className="space-y-1">
              <HatchBar value={pr.done} max={pr.total} />
              <p className="text-sm text-muted-foreground">{tp('stepsDone', { done: pr.done, total: pr.total })}</p>
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{task.due_date ? tp('dueOn', { date: formatDate(task.due_date, locale) }) : ''}</span>
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </div>
        </Link>
      </li>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-base text-muted-foreground">{t('subtitle')}</p>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <ListChecks className="h-10 w-10 text-muted-foreground" />
          <p className="text-base text-muted-foreground">{t('noTasks')}</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold tracking-tight">{tp('groupActive')}</h2>
              <ul className="space-y-3">{active.map(card)}</ul>
            </section>
          )}
          {done.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold tracking-tight">{tp('groupDone')}</h2>
              <ul className="space-y-3">{done.map(card)}</ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
