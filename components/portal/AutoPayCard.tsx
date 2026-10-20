'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { CreditCard } from 'lucide-react'
import { Button } from '@/components/ds/button'
import { removeCardAction, setAutoRenewAction } from '@/lib/db/payment-actions'
import type { ClientBillingPublic } from '@/lib/types'

/** Automatic monthly payments: what is on, which card, and two plain controls. */
export function AutoPayCard({ billing }: { billing: ClientBillingPublic }) {
  const t = useTranslations('portal.payments.auto')
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const res = await fn()
      if (!res.ok) setError(res.error ?? '')
      else {
        setError('')
        router.refresh()
      }
    })

  const failed = billing.status === 'failed'
  const on = billing.status === 'active' && billing.auto_renew
  return (
    <div className="space-y-3 rounded-3xl border border-border/60 bg-card p-5">
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6 shrink-0 text-flow-green" />
        <div>
          <p className="font-display text-lg font-bold">{failed ? t('failed') : on ? t('on') : t('off')}</p>
          <p className="text-sm text-muted-foreground" dir="ltr">
            {billing.card_brand} •••• {billing.card_last4}
          </p>
        </div>
      </div>
      {failed && <p className="text-base text-destructive">{t('failedHelp')}</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        {!failed && (
          <Button variant="outline" size="lg" disabled={pending} onClick={() => run(() => setAutoRenewAction(!on))} className="h-12 text-base">
            {on ? t('turnOff') : t('turnOn')}
          </Button>
        )}
        <Button variant="outline" size="lg" disabled={pending} onClick={() => run(removeCardAction)} className="h-12 text-base">
          {t('removeCard')}
        </Button>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
