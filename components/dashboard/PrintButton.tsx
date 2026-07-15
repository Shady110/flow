'use client'

import { useTranslations } from 'next-intl'
import { Download } from 'lucide-react'
import { Button } from '@/components/ds/button'

export function PrintButton() {
  const t = useTranslations('common')
  return (
    <Button variant="outline" onClick={() => window.print()}>
      <Download className="h-4 w-4" /> {t('download')}
    </Button>
  )
}
