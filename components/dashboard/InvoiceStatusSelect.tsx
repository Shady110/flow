'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateInvoiceStatusAction } from '@/lib/db/finance-actions'
import { INVOICE_STATUS_LABELS } from '@/lib/constants'
import type { InvoiceStatus } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ds/select'

export function InvoiceStatusSelect({ id, status }: { id: string; status: InvoiceStatus }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Select
      value={status}
      disabled={pending}
      onValueChange={(v) =>
        startTransition(async () => {
          const res = await updateInvoiceStatusAction(id, v as InvoiceStatus)
          if (!res.ok) {
            toast.error(res.error)
            return
          }
          toast.success('Invoice updated')
          router.refresh()
        })
      }
    >
      <SelectTrigger className="h-9 w-[130px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(INVOICE_STATUS_LABELS) as InvoiceStatus[]).map((s) => (
          <SelectItem key={s} value={s}>
            {INVOICE_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
