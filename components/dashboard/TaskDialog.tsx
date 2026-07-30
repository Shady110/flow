'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createTaskAction, updateTaskAction } from '@/lib/db/task-actions'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { Textarea } from '@/components/ds/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ds/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ds/dialog'
import { Checkbox } from '@/components/ds/checkbox'
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '@/lib/constants'
import type { TaskRow, TaskStatus, TaskPriority } from '@/lib/types'

interface Option {
  id: string
  label: string
}

interface TaskDialogProps {
  clients: Option[]
  team: Option[]
  fixedClientId?: string
  task?: TaskRow
  /** Creates a subtask of this task instead of a top-level one. */
  parentTaskId?: string
  trigger?: React.ReactNode
}

export function TaskDialog({
  clients,
  team,
  fixedClientId,
  task,
  parentTaskId,
  trigger,
}: TaskDialogProps) {
  const router = useRouter()
  const editing = !!task
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  // "Big task" only adds subtask lines at creation time; afterwards subtasks are
  // managed from the task's own page.
  const [big, setBig] = useState(false)
  const [subtasks, setSubtasks] = useState('')

  const [form, setForm] = useState({
    client_id: task?.client_id ?? fixedClientId ?? clients[0]?.id ?? '',
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: (task?.status ?? 'todo') as TaskStatus,
    priority: (task?.priority ?? 'medium') as TaskPriority,
    stage: task?.stage ?? '',
    next_step: task?.next_step ?? '',
    assignee_ids: task?.assignee_ids ?? [],
    start_date: task?.start_date ?? '',
    due_date: task?.due_date ?? '',
  })

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function toggleAssignee(id: string) {
    setForm((f) => ({
      ...f,
      assignee_ids: f.assignee_ids.includes(id)
        ? f.assignee_ids.filter((a) => a !== id)
        : [...f.assignee_ids, id],
    }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      ...form,
      ...(parentTaskId ? { parent_task_id: parentTaskId } : {}),
      subtask_titles: big
        ? subtasks.split('\n').map((l) => l.trim()).filter(Boolean)
        : undefined,
    }
    const res = editing ? await updateTaskAction(task!.id, payload) : await createTaskAction(payload)
    setLoading(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success(editing ? 'Task updated' : 'Task created')
    setOpen(false)
    setBig(false)
    setSubtasks('')
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4" /> New task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit task' : 'New task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {!fixedClientId && (
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={form.client_id} onValueChange={(v) => set('client_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="t-title">Title</Label>
            <Input id="t-title" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="t-desc">Description</Label>
            <Textarea id="t-desc" value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {TASK_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set('priority', v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {TASK_PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Assignees{' '}
              <span className="text-xs font-normal text-muted-foreground">
                {form.assignee_ids.length === 0
                  ? '(unassigned)'
                  : `(${form.assignee_ids.length} selected)`}
              </span>
            </Label>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-border p-3">
              {team.length === 0 && (
                <p className="text-sm text-muted-foreground">No team members yet.</p>
              )}
              {team.map((m) => (
                <label key={m.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.assignee_ids.includes(m.id)}
                    onCheckedChange={() => toggleAssignee(m.id)}
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="t-start">Start date</Label>
              <Input id="t-start" type="date" value={form.start_date ?? ''} onChange={(e) => set('start_date', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-due">Due date</Label>
              <Input id="t-due" type="date" value={form.due_date ?? ''} onChange={(e) => set('due_date', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="t-next">Next step</Label>
            <Input id="t-next" value={form.next_step ?? ''} onChange={(e) => set('next_step', e.target.value)} />
          </div>

          {!editing && !parentTaskId && (
            <div className="space-y-2 rounded-md border border-border p-3">
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="task-kind"
                    checked={!big}
                    onChange={() => setBig(false)}
                    className="h-4 w-4"
                  />
                  Single task
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="task-kind"
                    checked={big}
                    onChange={() => setBig(true)}
                    className="h-4 w-4"
                  />
                  Big task (split into subtasks)
                </label>
              </div>
              {big && (
                <div className="space-y-1.5">
                  <Label htmlFor="t-subs">
                    Subtasks <span className="text-xs text-muted-foreground">(one per line)</span>
                  </Label>
                  <Textarea
                    id="t-subs"
                    rows={4}
                    value={subtasks}
                    onChange={(e) => setSubtasks(e.target.value)}
                    placeholder={'Shoot the product\nWrite the listing\nUpload to Amazon'}
                  />
                  <p className="text-xs text-muted-foreground">
                    Each line becomes its own task you can assign and schedule separately.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : editing ? 'Save changes' : 'Create task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
