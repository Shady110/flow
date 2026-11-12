'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { updateAccountStatusAction, movePlatformStageAction } from '@/lib/db/flow-actions'
import { ACCOUNT_STATUSES } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { Textarea } from '@/components/ds/textarea'
import { StageSelect } from '@/components/flow/StageSelect'
import type { AccountStatus, ClientPlatform, PlatformStage } from '@/lib/types'

/**
 * The account manager's view of one marketplace account: its health, store
 * details, and the move from "pushing" to "managing". Statuses are typed in by
 * hand for now; a marketplace sync can fill them in later.
 */
export function AccountStatusCard({
  platform,
  nextStage,
}: {
  platform: ClientPlatform
  /** Set while the account is at "pushing": the stage the manager can move it to. */
  nextStage: PlatformStage | null
}) {
  const router = useRouter()
  const t = useTranslations('internal.accounts')
  const [status, setStatus] = useState<AccountStatus>(platform.account_status)
  const [store, setStore] = useState(platform.store_name ?? '')
  const [note, setNote] = useState(platform.status_note ?? '')
  const [pending, startTransition] = useTransition()

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{t('accountHealth')}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>{t('statusLabel')}</Label>
            <StageSelect value={status} label={t('statusLabel')}
              options={ACCOUNT_STATUSES.map((s) => ({ value: s, label: t(`status.${s}`) }))}
              onChange={setStatus} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="acc-store">{t('storeName')}</Label>
            <Input id="acc-store" value={store} onChange={(e) => setStore(e.target.value)} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="acc-note">{t('note')}</Label>
            <Textarea id="acc-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={pending}
            onClick={() => startTransition(async () => {
              const res = await updateAccountStatusAction({
                platformId: platform.id, clientId: platform.client_id,
                account_status: status, store_name: store.trim() || null, status_note: note.trim() || null,
              })
              if (!res.ok) return void toast.error(res.error)
              toast.success(t('saved'))
              router.refresh()
            })}>
            {t('save')}
          </Button>
          {nextStage && (
            <Button size="sm" variant="outline" disabled={pending}
              onClick={() => {
                if (!confirm(t('confirmStartManaging'))) return
                startTransition(async () => {
                  const res = await movePlatformStageAction({ platformId: platform.id, stage: nextStage })
                  if (!res.ok) return void toast.error(res.error)
                  toast.success(t('nowManaging'))
                  router.refresh()
                })
              }}>
              {t('startManaging')}
            </Button>
          )}
        </div>
        {platform.checked_at && (
          <p className="text-xs text-muted-foreground">
            {t('lastChecked', { when: new Date(platform.checked_at).toLocaleString() })}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
