'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
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
import type { ActionResult } from '@/lib/db/client-actions'

/**
 * One confirm-then-delete button for every entity. Takes the server action by
 * reference plus its plain arguments, so a server component can wire any
 * `delete*Action` without a bespoke component per table.
 *
 * Stops click propagation so it can live inside a LinkedTableRow.
 */
export function ConfirmDelete<A extends unknown[]>({
  action,
  args,
  title,
  description,
  label,
  confirmLabel,
  successMessage,
  redirectTo,
  compact,
}: {
  action: (...a: A) => Promise<ActionResult>
  args: A
  /** Heading of the confirm dialog, e.g. 'Delete "Acme Co"?' */
  title: string
  description?: string
  label?: string
  confirmLabel?: string
  successMessage?: string
  /** Navigate here after a successful delete; omit to stay and refresh. */
  redirectTo?: string
  /** Icon-only ghost button, for dense rows. */
  compact?: boolean
}) {
  const router = useRouter()
  const t = useTranslations('internal.common')
  const tt = useTranslations('internal.taskDetail')
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function onDelete() {
    startTransition(async () => {
      const res = await action(...args)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success(successMessage ?? t('delete'))
      setOpen(false)
      if (redirectTo) router.push(redirectTo)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={compact ? 'ghost' : 'outline'}
          size={compact ? 'sm' : 'default'}
          className="text-destructive hover:text-destructive"
          onClick={(e) => e.stopPropagation()}
          aria-label={compact ? (label ?? t('delete')) : undefined}
        >
          <Trash2 className="h-4 w-4" />
          {!compact && (label ?? t('delete'))}
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description ?? tt('cannotUndo')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            {t('cancel')}
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={pending}>
            {pending ? t('saving') : (confirmLabel ?? label ?? t('delete'))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
