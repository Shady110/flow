'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { deleteTaskAction } from '@/lib/db/task-actions'
import { Button } from '@/components/ds/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ds/dialog'

export function DeleteTaskButton({
  id,
  clientId,
  title,
  subtaskCount = 0,
  redirectTo,
  compact,
}: {
  id: string
  clientId: string
  title: string
  subtaskCount?: number
  /** Where to go after deleting. Omit to stay put and just refresh. */
  redirectTo?: string
  compact?: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function onDelete() {
    startTransition(async () => {
      const res = await deleteTaskAction(id, clientId)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success('Task deleted')
      setOpen(false)
      if (redirectTo) router.push(redirectTo)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Stop the click bubbling to a clickable parent row (LinkedTableRow). */}
        <Button
          variant={compact ? 'ghost' : 'outline'}
          size={compact ? 'sm' : 'default'}
          className="text-destructive hover:text-destructive"
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2 className="h-4 w-4" />
          {!compact && ' Delete'}
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Delete “{title}”?</DialogTitle>
          <DialogDescription>
            {subtaskCount > 0
              ? `This also deletes ${subtaskCount} subtask${subtaskCount === 1 ? '' : 's'}. This cannot be undone.`
              : 'This cannot be undone.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={pending}>
            {pending ? 'Deleting…' : 'Delete task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
