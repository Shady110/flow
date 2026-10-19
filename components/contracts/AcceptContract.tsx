'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { acceptContractAction } from '@/lib/db/contract-actions'
import { Button } from '@/components/ds/button'
import { Checkbox } from '@/components/ds/checkbox'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'

/** Type your full name, tick "I agree", accept. */
export function AcceptContract({ contractId }: { contractId: string }) {
  const router = useRouter()
  const t = useTranslations('portal.contract')
  const [name, setName] = useState('')
  const [agree, setAgree] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <form
      className="no-print mx-auto max-w-3xl space-y-4 rounded-2xl border border-border bg-card p-5"
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          const res = await acceptContractAction({ contractId, name, agree })
          if (!res.ok) return void toast.error(res.error)
          toast.success(t('thanks'))
          router.refresh()
        })
      }}
    >
      <div className="space-y-1">
        <Label htmlFor="sign-name">{t('fullName')}</Label>
        <Input id="sign-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <label className="flex items-start gap-3 text-sm">
        <Checkbox className="mt-0.5" checked={agree} onCheckedChange={(v) => setAgree(!!v)} />
        <span>{t('agree')}</span>
      </label>
      <Button type="submit" className="w-full sm:w-auto" disabled={pending || !agree || name.trim().length < 2}>
        {t('accept')}
      </Button>
    </form>
  )
}
