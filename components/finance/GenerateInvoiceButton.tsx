'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ds/button'
import { generateInvoiceNowAction } from '@/lib/db/payment-actions'

/** Create this month's invoice from the signed contract now (the daily job normally does it). */
export function GenerateInvoiceButton({ clientId }: { clientId: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await generateInvoiceNowAction(clientId)
          if (!res.ok) return void toast.error(res.error)
          toast.success(res.created ? 'This month’s invoice was created' : 'Nothing to create: this month is already invoiced, or the contract has no monthly price due yet.')
          router.refresh()
        })
      }
    >
      Create this month’s invoice
    </Button>
  )
}
