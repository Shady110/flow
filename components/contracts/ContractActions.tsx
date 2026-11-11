'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Copy } from 'lucide-react'
import {
  deleteContractAction,
  duplicateContractAction,
  markAcceptedOfflineAction,
  sendContractAction,
  voidContractAction,
} from '@/lib/db/contract-actions'
import { portalOrigin } from '@/lib/tenant'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ds/dialog'
import type { ContractStatus } from '@/lib/types'

type Ask = 'send' | 'offline' | 'delete' | 'void' | null

/** Status-dependent buttons on the team's contract page; confirmations are dialogs, not browser pop-ups. */
export function ContractActions({ id, status }: { id: string; status: ContractStatus }) {
  const router = useRouter()
  const t = useTranslations('internal.contracts')
  const [pending, startTransition] = useTransition()
  const [ask, setAsk] = useState<Ask>(null)
  const [signer, setSigner] = useState('')

  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>, then?: () => void) =>
    startTransition(async () => {
      const res = await fn()
      if (!res.ok) return void toast.error(res.error)
      setAsk(null)
      if (then) then()
      else router.refresh()
    })

  const confirm = () => {
    if (ask === 'send') run(() => sendContractAction(id), () => { toast.success(t('sent')); router.refresh() })
    if (ask === 'offline') {
      if (signer.trim().length < 2) return void toast.error(t('offlinePrompt'))
      run(() => markAcceptedOfflineAction(id, signer), () => { toast.success(t('accepted')); router.refresh() })
    }
    if (ask === 'delete') run(() => deleteContractAction(id), () => router.push('/contracts'))
    if (ask === 'void') run(() => voidContractAction(id))
  }

  async function copyLink() {
    const url = `${portalOrigin('client', process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? window.location.host.replace(/^app\./, ''))}/contract`
    try {
      await navigator.clipboard.writeText(url)
      toast.success(t('linkCopied'))
    } catch {
      toast.error(url)
    }
  }

  const dialog: Record<Exclude<Ask, null>, { title: string; text: string; go: string; danger?: boolean }> = {
    send: { title: t('send'), text: t('confirmSend'), go: t('send') },
    offline: { title: t('markOffline'), text: t('offlinePrompt'), go: t('markOffline') },
    delete: { title: t('delete'), text: t('confirmDeleteDraft'), go: t('delete'), danger: true },
    void: { title: t('void'), text: t('confirmVoid'), go: t('void'), danger: true },
  }
  const d = ask ? dialog[ask] : null

  return (
    <div className="no-print flex flex-wrap gap-2">
      {status === 'draft' && <Button disabled={pending} onClick={() => setAsk('send')}>{t('send')}</Button>}
      {status === 'sent' && (
        <Button variant="outline" onClick={copyLink}>
          <Copy className="me-2 h-4 w-4" /> {t('copyLink')}
        </Button>
      )}
      {(status === 'draft' || status === 'sent') && (
        <Button variant="outline" disabled={pending} onClick={() => { setSigner(''); setAsk('offline') }}>{t('markOffline')}</Button>
      )}
      {status !== 'draft' && (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await duplicateContractAction(id)
              if (!res.ok) return void toast.error(res.error)
              router.push(`/contracts/${res.id}`)
            })
          }
        >
          {t('duplicate')}
        </Button>
      )}
      {(status === 'draft' || status === 'sent') && (
        <Button variant="ghost" className="text-destructive" disabled={pending} onClick={() => setAsk(status === 'draft' ? 'delete' : 'void')}>
          {status === 'draft' ? t('delete') : t('void')}
        </Button>
      )}

      <Dialog open={!!ask} onOpenChange={(o) => !o && setAsk(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{d?.title}</DialogTitle>
            <DialogDescription>{d?.text}</DialogDescription>
          </DialogHeader>
          {ask === 'offline' && <Input autoFocus value={signer} onChange={(e) => setSigner(e.target.value)} />}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAsk(null)}>{t('cancel')}</Button>
            <Button variant={d?.danger ? 'destructive' : 'default'} disabled={pending} onClick={confirm}>{d?.go}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
