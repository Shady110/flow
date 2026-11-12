'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { saveCompanySettingsAction } from '@/lib/db/flow-actions'
import type { CompanySettings as Settings } from '@/lib/db/flow-queries'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { Textarea } from '@/components/ds/textarea'

export function CompanySettings({ settings }: { settings: Settings }) {
  const t = useTranslations('internal.company')
  const [cap, setCap] = useState(String(settings.cap))
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp)
  const [paymentEn, setPaymentEn] = useState(settings.paymentEn)
  const [paymentAr, setPaymentAr] = useState(settings.paymentAr)
  const [pending, startTransition] = useTransition()

  return (
    <form
      className="max-w-2xl space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          const res = await saveCompanySettingsAction({ cap: Number(cap), whatsapp, paymentEn, paymentAr })
          if (res.ok) toast.success(t('saved'))
          else toast.error(res.error)
        })
      }}
    >
      <div className="max-w-sm space-y-1">
        <Label htmlFor="cap">{t('cap')}</Label>
        <Input id="cap" type="number" min="0" max="1000" step="1" inputMode="numeric" value={cap} onChange={(e) => setCap(e.target.value)} />
        <p className="text-xs text-muted-foreground">{t('capHint')}</p>
      </div>

      <div className="max-w-sm space-y-1">
        <Label htmlFor="wa">{t('whatsapp')}</Label>
        <Input id="wa" type="tel" inputMode="tel" dir="ltr" placeholder="01012345678" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        <p className="text-xs text-muted-foreground">{t('whatsappHint')}</p>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium">{t('payment')}</p>
          <p className="text-xs text-muted-foreground">{t('paymentHint')}</p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="pay-en">{t('paymentEn')}</Label>
          <Textarea id="pay-en" rows={4} value={paymentEn} onChange={(e) => setPaymentEn(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="pay-ar">{t('paymentAr')}</Label>
          <Textarea id="pay-ar" rows={4} dir="rtl" value={paymentAr} onChange={(e) => setPaymentAr(e.target.value)} />
        </div>
      </div>

      <Button type="submit" disabled={pending}>{t('save')}</Button>
    </form>
  )
}
