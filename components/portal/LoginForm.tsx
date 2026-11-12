'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'

/** Big, calm sign-in: two fields, a show-password eye, errors in plain words. */
export function LoginForm({ helpHref }: { helpHref: string | null }) {
  const router = useRouter()
  const t = useTranslations('portal.login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) {
      setError(/invalid login|invalid credentials/i.test(error.message) ? t('wrongCredentials') : t('genericError'))
      return
    }
    router.replace('/')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-base">{t('email')}</Label>
        <Input id="email" type="email" inputMode="email" autoComplete="email" dir="ltr" className="h-14 text-base" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-base">{t('password')}</Label>
        <div className="relative">
          <Input
            id="password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            dir="ltr"
            className="h-14 pe-14 text-base"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? t('hidePassword') : t('showPassword')}
            className="absolute end-1 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-muted-foreground"
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {error && <p role="alert" className="rounded-2xl bg-destructive/10 p-4 text-base text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="h-14 w-full text-base" disabled={loading}>
        {loading ? t('signingIn') : t('signIn')}
      </Button>
      {helpHref && (
        <a href={helpHref} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center gap-2 text-base font-medium text-[var(--brand-ink)]">
          <MessageCircle className="h-5 w-5" /> {t('help')}
        </a>
      )}
    </form>
  )
}
