'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { MessageCircle } from 'lucide-react'
import { signInAction } from '@/lib/auth/actions'
import { PRODUCT } from '@/lib/product'
import { Button } from '@/components/ds/button'
import { ShimmerButton } from '@/components/ds/shimmer-button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { PasswordField } from '@/components/auth/PasswordField'

/** The one sign-in form for both dashboards. `client` is the big, calm look. */
export function SignInForm({ variant, helpHref }: { variant: 'team' | 'client'; helpHref?: string | null }) {
  const t = useTranslations('auth')
  const router = useRouter()
  const big = variant === 'client'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const res = await signInAction({ email, password })
      if (res.ok) {
        router.replace(res.mustChange ? '/change-password' : variant === 'team' ? '/?start=1' : '/')
        router.refresh()
        return
      }
      if (res.error === 'wrongAddress') {
        const other = PRODUCT[variant === 'team' ? 'client' : 'internal'].name
        setError(t('errors.wrongAddress', { product: other, address: res.otherOrigin.replace(/^https?:\/\//, '') }))
      } else setError(t(`errors.${res.error}`))
    })
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className={big ? 'text-base' : undefined}>{t('email')}</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          dir="ltr"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={big ? 'h-14 text-base' : 'h-12'}
        />
      </div>
      <PasswordField id="password" label={t('password')} value={password} onChange={setPassword} autoComplete="current-password" big={big} />
      {error && (
        <p role="alert" className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      )}
      {big ? (
        <Button type="submit" size="lg" disabled={pending} className="h-14 w-full text-base">
          {pending ? t('signingIn') : t('signIn')}
        </Button>
      ) : (
        <ShimmerButton
          type="submit"
          disabled={pending}
          background="var(--color-flow-green)"
          shimmerColor="#C4F075"
          borderRadius="12px"
          className="h-12 w-full text-base font-semibold disabled:opacity-60"
        >
          {pending ? t('signingIn') : t('signIn')}
        </ShimmerButton>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link href="/forgot-password" className="inline-flex min-h-11 items-center font-medium text-flow-green hover:underline">
          {t('forgot')}
        </Link>
        {helpHref && (
          <a href={helpHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 font-medium text-flow-green hover:underline">
            <MessageCircle className="h-4 w-4" /> {t('help')}
          </a>
        )}
      </div>
    </form>
  )
}
