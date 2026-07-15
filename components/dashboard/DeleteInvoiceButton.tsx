'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { deleteInvoiceAction } from '@/lib/db/finance-actions'
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

export function DeleteInvoiceButton({ id, number }: { id: string; number: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function onDelete() {
    startTransition(async () => {
      const res = await deleteInvoiceAction(id)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success('Invoice deleted')
      setOpen(false)
      router.push('/finance')
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete invoice {number}?</DialogTitle>
          <DialogDescription>
            This permanently removes the invoice and its line items. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={pending}>
            {pending ? 'Deleting…' : 'Delete invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
