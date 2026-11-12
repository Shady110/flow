import { getLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/format'
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm'

/** "My account": change password and see my own recent sign-in activity. Same in both dashboards. */
export async function AccountView({ userId, email }: { userId: string; email: string }) {
  const [t, locale, supabase] = await Promise.all([getTranslations('auth'), getLocale(), createClient()])
  const { data: events } = await supabase
    .from('auth_events')
    .select('id, event, created_at, host')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">{t('account.title')}</h1>
      <section className="space-y-4 rounded-3xl border border-border/60 bg-card p-5 sm:p-7">
        <h2 className="font-display text-xl font-bold">{t('account.changePassword')}</h2>
        <ChangePasswordForm email={email} forced={false} />
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">{t('account.recent')}</h2>
        {!events?.length ? (
          <p className="text-muted-foreground">{t('account.none')}</p>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border/60 bg-card">
            {events.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="font-medium">{t(`account.events.${e.event}`)}</span>
                <span className="text-muted-foreground">{formatDateTime(e.created_at, locale)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
