'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { cn } from '@/lib/utils'

/** Label + password input with a show/hide eye. `big` is the client look. */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  big,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  autoComplete: 'current-password' | 'new-password'
  big?: boolean
  placeholder?: string
}) {
  const t = useTranslations('auth')
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={big ? 'text-base' : undefined}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          dir="ltr"
          required
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn('pe-14', big ? 'h-14 text-base' : 'h-12')}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? t('hidePassword') : t('showPassword')}
          className="absolute end-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted-foreground"
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  )
}
