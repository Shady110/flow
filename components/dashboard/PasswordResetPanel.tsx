'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { KeyRound, Mail } from 'lucide-react'
import { emailResetLinkAction, resetUserPasswordAction } from '@/lib/db/account-actions'
import { Button } from '@/components/ds/button'
import { CredentialsCard } from '@/components/dashboard/CredentialsCard'

/** Two ways to help someone who is locked out: a new one-time password, or an emailed reset link. */
export function PasswordResetPanel({ userId }: { userId: string }) {
  const [pending, start] = useTransition()
  const [creds, setCreds] = useState<{ kind: 'staff' | 'client'; email: string; password: string; signInUrl?: string } | null>(null)

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <p className="text-sm font-medium">Locked out?</p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await resetUserPasswordAction({ userId })
              if (!res.ok) return void toast.error(res.error)
              setCreds({ kind: res.kind!, email: res.email ?? '', password: res.tempPassword!, signInUrl: res.signInUrl })
            })
          }
        >
          <KeyRound className="h-4 w-4" /> Issue a one-time password
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await emailResetLinkAction({ userId })
              if (res.ok) toast.success('Reset link emailed')
              else toast.error(res.error)
            })
          }
        >
          <Mail className="h-4 w-4" /> Email a reset link
        </Button>
      </div>
      {creds && <CredentialsCard {...creds} />}
    </div>
  )
}
