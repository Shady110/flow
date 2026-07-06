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
import {
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  type Task,
  type TaskStatus,
  type TaskPriority,
} from '@/lib/types'

interface Option {
  id: string
  label: string
}

interface TaskDialogProps {
  clients: Option[]
  team: Option[]
  fixedClientId?: string
  task?: Task
  trigger?: React.ReactNode
}

const UNASSIGNED = '__none__'

export function TaskDialog({ clients, team, fixedClientId, task, trigger }: TaskDialogProps) {
  const router = useRouter()
  const editing = !!task
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    client_id: task?.client_id ?? fixedClientId ?? clients[0]?.id ?? '',
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: (task?.status ?? 'todo') as TaskStatus,
    priority: (task?.priority ?? 'medium') as TaskPriority,
    stage: task?.stage ?? '',
    next_step: task?.next_step ?? '',
    assignee_id: task?.assignee_id ?? UNASSIGNED,
    start_date: task?.start_date ?? '',
    due_date: task?.due_date ?? '',
  })

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      ...form,
      assignee_id: form.assignee_id === UNASSIGNED ? null : form.assignee_id,
    }
    const res = editing ? await updateTaskAction(task!.id, payload) : await createTaskAction(payload)
    setLoading(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success(editing ? 'Task updated' : 'Task created')
    setOpen(false)
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
            <Label>Assignee</Label>
            <Select value={form.assignee_id} onValueChange={(v) => set('assignee_id', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                {team.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
