'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { changePasswordAction } from '@/lib/auth/actions'
import { checkPassword } from '@/lib/auth/password-policy'
import { Button } from '@/components/ds/button'
import { PasswordField } from '@/components/auth/PasswordField'
import { cn } from '@/lib/utils'

/**
 * Choose a new password. `forced` (first sign-in, one-time password, or emailed
 * link) skips the current password; a voluntary change asks for it. Rules show
 * live and are enforced again on the server.
 */
export function ChangePasswordForm({ email, forced, big, afterPath = '/' }: { email: string; forced: boolean; big?: boolean; afterPath?: string }) {
  const t = useTranslations('auth.change')
  const router = useRouter()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [again, setAgain] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const check = checkPassword(next, email)

  const rules: [boolean, string][] = [
    [check.longEnough, t('rules.long')],
    [check.lettersAndNumbers, t('rules.mix')],
    [check.notEmail, t('rules.notEmail')],
    [check.notCommon, t('rules.notCommon')],
  ]

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (next !== again) return setError(t('mismatch'))
    start(async () => {
      const res = await changePasswordAction({ current: forced ? undefined : current, next })
      if (res.ok) {
        toast.success(t('saved'))
        router.replace(afterPath)
        router.refresh()
      } else setError(res.error === 'weak' ? t('weak') : res.error === 'wrongCurrent' ? t('wrongCurrent') : t('generic'))
    })
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {!forced && <PasswordField id="cp-current" label={t('current')} value={current} onChange={setCurrent} autoComplete="current-password" big={big} />}
      <PasswordField id="cp-new" label={t('new')} value={next} onChange={setNext} autoComplete="new-password" big={big} />
      <ul className="space-y-1.5 text-sm">
        {rules.map(([ok, label]) => (
          <li key={label} className={cn('flex items-center gap-2', ok ? 'text-foreground' : 'text-muted-foreground')}>
            <span className={cn('flex h-5 w-5 items-center justify-center rounded-full', ok ? 'bg-flow-green text-flow-lime' : 'bg-muted')}>
              {ok && <Check className="h-3 w-3" />}
            </span>
            {label}
          </li>
        ))}
      </ul>
      <PasswordField id="cp-again" label={t('again')} value={again} onChange={setAgain} autoComplete="new-password" big={big} />
      {error && <p role="alert" className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" disabled={pending || !check.ok} className={big ? 'h-14 w-full text-base' : 'h-12 w-full'}>
        {pending ? t('saving') : t('save')}
      </Button>
    </form>
  )
}
