import { requireClientContext } from '@/lib/auth/client-session'
import { createClient } from '@/lib/supabase/server'
import type { Task } from '@/lib/types'
import { Card, CardContent } from '@/components/ds/card'
import { TaskStatusBadge, DeadlineIndicator } from '@/components/dashboard/indicators'

export default async function PortalTasks() {
  const { client } = await requireClientContext()
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
        <h1 className="font-display text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="mt-1 text-sm text-muted-foreground">What the FLOW team is working on for you.</p>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks yet.</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium">{t.title}</p>
                  {t.next_step && <p className="text-xs text-muted-foreground">Next: {t.next_step}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <DeadlineIndicator dueDate={t.due_date} status={t.status} />
                  <TaskStatusBadge status={t.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
