'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  deleteContractAction,
  markAcceptedOfflineAction,
  sendContractAction,
  voidContractAction,
} from '@/lib/db/contract-actions'
import { Button } from '@/components/ds/button'
import type { ContractStatus } from '@/lib/types'

/** Status-dependent buttons on the CEO's contract page. */
export function ContractActions({ id, status }: { id: string; status: ContractStatus }) {
  const router = useRouter()
  const t = useTranslations('internal.contracts')
  const [pending, startTransition] = useTransition()

  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>, then?: () => void) =>
    startTransition(async () => {
      const res = await fn()
      if (!res.ok) return void toast.error(res.error)
      if (then) then()
      else router.refresh()
    })

  return (
    <div className="no-print flex flex-wrap gap-2">
      {status === 'draft' && (
        <Button disabled={pending} onClick={() => {
          if (confirm(t('confirmSend'))) run(() => sendContractAction(id), () => { toast.success(t('sent')); router.refresh() })
        }}>
          {t('send')}
        </Button>
      )}
      {(status === 'draft' || status === 'sent') && (
        <Button variant="outline" disabled={pending} onClick={() => {
          const name = window.prompt(t('offlinePrompt'))
          if (name) run(() => markAcceptedOfflineAction(id, name), () => { toast.success(t('accepted')); router.refresh() })
        }}>
          {t('markOffline')}
        </Button>
      )}
      {(status === 'draft' || status === 'sent') && (
        <Button variant="ghost" className="text-destructive" disabled={pending} onClick={() => {
          if (status === 'draft') {
            if (confirm(t('confirmDeleteDraft'))) run(() => deleteContractAction(id), () => router.push('/contracts'))
          } else if (confirm(t('confirmVoid'))) run(() => voidContractAction(id))
        }}>
          {status === 'draft' ? t('delete') : t('void')}
        </Button>
      )}
    </div>
  )
}
