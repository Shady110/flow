import { getTranslations } from 'next-intl/server'
import { AlertTriangle } from 'lucide-react'
import type { ExpiringAccount } from '@/lib/db/social-queries'

/**
 * Access-token expiry warning.
 *
 * Exists before publishing does, on purpose. A lapsed token is the one failure
 * in this feature that is completely silent: posts stop going out and nothing
 * says so until someone notices the feed is quiet. Surfacing it on the page
 * people already open every day is the cheapest possible guard.
 *
 * Takes an already-filtered list. Deciding *which* accounts are in trouble
 * means reading the clock, and that belongs in the query layer — doing it
 * during render is impure and makes the server and browser disagree.
 *
 * Renders nothing when there is nothing wrong: a permanently-present empty
 * banner trains people to ignore the space it occupies.
 */
export async function TokenWarning({ accounts }: { accounts: ExpiringAccount[] }) {
  if (accounts.length === 0) return null
  const t = await getTranslations('internal.social')

  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/50">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="space-y-1">
        <p className="font-medium text-amber-900 dark:text-amber-200">{t('tokenWarning')}</p>
        <ul className="text-amber-800 dark:text-amber-300">
          {accounts.map((a) => (
            <li key={a.id}>
              {a.displayName} —{' '}
              {a.expired
                ? t('tokenExpired')
                : t('tokenExpiring', {
                    date: new Date(a.expiresAt).toLocaleDateString('en-GB'),
                  })}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
