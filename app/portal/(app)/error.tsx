'use client'

import { useTranslations } from 'next-intl'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ds/button'

/** A calm screen instead of a crash: say it's not their fault, offer one button. */
export default function PortalError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('portal.common')
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-flow-green">
        <RefreshCw className="h-7 w-7" />
      </span>
      <h1 className="font-display text-2xl font-bold">{t('errorTitle')}</h1>
      <p className="text-muted-foreground">{t('errorHelp')}</p>
      <Button size="lg" onClick={reset}>{t('retry')}</Button>
    </div>
  )
}
