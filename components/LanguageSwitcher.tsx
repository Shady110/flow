'use client'

import { useTransition } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'
import { setLocaleAction } from '@/lib/i18n/locale-actions'
import type { Locale } from '@/i18n/config'
import { cn } from '@/lib/utils'

interface Props {
  /** Visual tone: `light` for dark backgrounds (marketing navbar), `dark` otherwise. */
  tone?: 'light' | 'dark'
  className?: string
}

/**
 * Toggles between English and Arabic. Persists the choice via a server action
 * (cookie + DB), then refreshes so the new locale + direction take effect.
 */
export default function LanguageSwitcher({ tone = 'dark', className }: Props) {
  const locale = useLocale() as Locale
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const next: Locale = locale === 'ar' ? 'en' : 'ar'
  // Show the language you'd switch TO.
  const label = next === 'ar' ? 'العربية' : 'EN'

  function toggle() {
    startTransition(async () => {
      await setLocaleAction(next)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={next === 'ar' ? 'التبديل إلى العربية' : 'Switch to English'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60',
        tone === 'light'
          ? 'text-white/80 hover:text-white hover:bg-white/10'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        className,
      )}
    >
      <Globe className="h-4 w-4" />
      <span>{label}</span>
    </button>
  )
}
