'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { updateInvoiceStatusAction } from '@/lib/db/finance-actions'
import type { InvoiceStatus } from '@/lib/types'

const INVOICE_STATUSES: InvoiceStatus[] = ['draft', 'sent', 'paid', 'void']
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ds/select'

export function InvoiceStatusSelect({ id, status }: { id: string; status: InvoiceStatus }) {
  const router = useRouter()
  const t = useTranslations('internal.invoiceStatus')
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
        {INVOICE_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {t(s)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
