import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { TeamAuthLayout } from '@/components/auth/AuthLayouts'
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm'

/** Where an owed password change lands: first sign-in, one-time password, or emailed reset link. */
export default async function ChangePasswordPage() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser()
  if (!user?.email) redirect('/login')
  const forced = user.app_metadata?.must_change_password === true
  const t = await getTranslations('auth.change')
  return (
    <TeamAuthLayout>
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-flow-green">{forced ? t('firstTitle') : t('title')}</h1>
        {forced && <p className="mt-2 text-base text-muted-foreground">{t('firstIntro')}</p>}
      </div>
      <ChangePasswordForm email={user.email} forced={forced} big={false} />
    </TeamAuthLayout>
  )
}
