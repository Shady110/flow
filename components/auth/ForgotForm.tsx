'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { MailCheck } from 'lucide-react'
import { requestResetAction } from '@/lib/auth/actions'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'

/** "Forgot password": always ends on the same calm "check your email" message. */
export function ForgotForm({ big, expired }: { big?: boolean; expired?: boolean }) {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [pending, start] = useTransition()

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <MailCheck className="mx-auto h-12 w-12 text-flow-green" />
        <h2 className="font-display text-2xl font-bold">{t('forgotPage.sentTitle')}</h2>
        <p className="text-base text-muted-foreground">{t('forgotPage.sentHelp')}</p>
        <Link href="/login" className="inline-flex min-h-11 items-center font-medium text-flow-green hover:underline">
          {t('backToSignIn')}
        </Link>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        start(async () => {
          await requestResetAction(email)
          setSent(true)
        })
      }}
      className="space-y-5"
    >
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{t('forgotPage.title')}</h1>
        <p className="mt-2 text-base text-muted-foreground">{t('forgotPage.intro')}</p>
      </div>
      {expired && <p role="alert" className="rounded-2xl bg-amber-100 p-4 text-sm text-amber-900">{t('forgotPage.expired')}</p>}
      <div className="space-y-2">
        <Label htmlFor="fp-email" className={big ? 'text-base' : undefined}>{t('email')}</Label>
        <Input id="fp-email" type="email" inputMode="email" autoComplete="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} className={big ? 'h-14 text-base' : 'h-12'} />
      </div>
      <Button type="submit" size="lg" disabled={pending} className={big ? 'h-14 w-full text-base' : 'h-12 w-full'}>
        {pending ? t('forgotPage.sending') : t('forgotPage.send')}
      </Button>
      <Link href="/login" className="flex min-h-11 items-center justify-center text-sm font-medium text-flow-green hover:underline">
        {t('backToSignIn')}
      </Link>
    </form>
  )
}
