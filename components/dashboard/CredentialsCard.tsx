'use client'

import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ds/button'
import { PRODUCT } from '@/lib/product'

/**
 * Everything a new person needs to get in, in one place: the address, their
 * email and the one-time password, plus a ready-to-send message. Shown once.
 */
export function CredentialsCard({
  kind,
  signInUrl,
  email,
  password,
}: {
  kind: 'staff' | 'client'
  signInUrl?: string
  email: string
  password: string
}) {
  const product = PRODUCT[kind === 'staff' ? 'internal' : 'client'].name
  const message =
    kind === 'client'
      ? `أهلاً! حسابك على ${product} جاهز.\nالرابط: ${signInUrl}\nالبريد: ${email}\nكلمة المرور المؤقتة: ${password}\nستختار كلمة مرور خاصة بك عند أول دخول.`
      : `Your ${product} account is ready.\nSign in: ${signInUrl}\nEmail: ${email}\nOne-time password: ${password}\nYou'll choose your own password the first time you sign in.`

  const copy = (text: string, label: string) => {
    void navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
      {signInUrl && (
        <div>
          <p className="text-xs text-muted-foreground">Sign-in address</p>
          <p className="font-medium" dir="ltr">{signInUrl}</p>
        </div>
      )}
      <div>
        <p className="text-xs text-muted-foreground">Email</p>
        <p className="font-medium" dir="ltr">{email}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">One-time password (shown once)</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded bg-background px-2 py-1.5">{password}</code>
          <Button type="button" variant="outline" size="sm" onClick={() => copy(password, 'Password')} aria-label="Copy password">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => copy(message, 'Message')}>
        <Copy className="h-4 w-4" /> Copy invite message
      </Button>
      <p className="text-xs text-muted-foreground">They must choose their own password at first sign-in.</p>
    </div>
  )
}
