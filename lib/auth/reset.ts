import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { lookupAccount } from '@/lib/auth/account'
import { sendMail } from '@/lib/email/send'
import { resetEmail } from '@/lib/email/reset-email'
import { portalOrigin } from '@/lib/tenant'

const ROOT = () => process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000'

/**
 * Email a one-time "choose a new password" link to the right address for that
 * account (team or client dashboard). Silent when the email is unknown, so the
 * caller can answer the same either way. Returns whether an email went out.
 */
export async function sendResetLink(email: string): Promise<boolean> {
  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.generateLink({ type: 'recovery', email })
  if (error || !data?.user || !data.properties?.hashed_token) return false

  const account = await lookupAccount(data.user.id)
  if (!account?.active) return false

  const origin = portalOrigin(account.kind === 'staff' ? 'internal' : 'client', ROOT())
  const link = `${origin}/auth/confirm?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=recovery`
  await sendMail({ to: email, ...resetEmail(link, account.kind) })
  return true
}
