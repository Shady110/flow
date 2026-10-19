'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { setMonthlyClientCapAction } from '@/lib/db/flow-actions'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'

export function CompanySettings({ cap }: { cap: number }) {
  const t = useTranslations('internal.company')
  const [value, setValue] = useState(String(cap))
  const [pending, startTransition] = useTransition()

  return (
    <form
      className="max-w-sm space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          const res = await setMonthlyClientCapAction(Number(value))
          if (res.ok) toast.success(t('saved'))
          else toast.error(res.error)
        })
      }}
    >
      <div className="space-y-1">
        <Label htmlFor="cap">{t('cap')}</Label>
        <Input id="cap" type="number" min="0" max="1000" step="1" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} />
        <p className="text-xs text-muted-foreground">{t('capHint')}</p>
      </div>
      <Button type="submit" disabled={pending}>{t('save')}</Button>
    </form>
  )
}
