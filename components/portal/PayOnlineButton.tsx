'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { CreditCard, Loader2 } from 'lucide-react'
import { Button } from '@/components/ds/button'
import { startCheckoutAction } from '@/lib/db/payment-actions'

/** One big tap to the secure payment page. `offerAuto` adds the "pay every month" tick (when automatic payments are on). */
export function PayOnlineButton({
  invoiceId,
  amountText,
  offerAuto,
  className,
}: {
  invoiceId: string
  amountText: string
  offerAuto?: boolean
  className?: string
}) {
  const t = useTranslations('portal.payments')
  const [auto, setAuto] = useState(false)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  const go = () =>
    start(async () => {
      setError('')
      const res = await startCheckoutAction({ invoiceId, saveCard: auto })
      if (res.ok && res.url) window.location.assign(res.url)
      else setError(res.ok ? t('payFailed') : res.error)
    })

  return (
    <div className="space-y-2">
      <Button size="lg" onClick={go} disabled={pending} className={className ?? 'h-12 w-full text-base'}>
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />} {t('payNow', { amount: amountText })}
      </Button>
      {offerAuto && (
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base">
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="h-5 w-5 accent-[var(--brand-ink)]" />
          {t('autoTick')}
        </label>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
