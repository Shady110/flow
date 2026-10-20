'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { celebrate } from '@/components/portal/celebrate'

const LOOK = {
  ok: { Icon: CheckCircle2, box: 'bg-flow-lime/40', icon: 'text-flow-green' },
  pending: { Icon: Clock, box: 'bg-amber-100', icon: 'text-amber-900' },
  failed: { Icon: XCircle, box: 'bg-destructive/10', icon: 'text-destructive' },
} as const

/** Plain-language result after coming back from the payment page. */
export function PayResultBanner({ result }: { result: keyof typeof LOOK }) {
  const t = useTranslations('portal.payments')
  useEffect(() => {
    if (result === 'ok') void celebrate()
  }, [result])
  const { Icon, box, icon } = LOOK[result]
  return (
    <div role="status" className={`flex items-center gap-4 rounded-3xl p-5 ${box}`}>
      <Icon className={`h-9 w-9 shrink-0 ${icon}`} />
      <div>
        <p className="font-display text-xl font-bold">{t(`result.${result}.title`)}</p>
        <p className="text-base text-muted-foreground">{t(`result.${result}.help`)}</p>
      </div>
    </div>
  )
}
