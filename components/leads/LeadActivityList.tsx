import { format } from 'date-fns'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import type { LeadActivity } from '@/lib/types'

/** Newest-first log of every contact with the lead. */
export async function LeadActivityList({
  activities,
  names,
}: {
  activities: LeadActivity[]
  names: Record<string, string>
}) {
  const t = await getTranslations('internal.leads')
  const ts = await getTranslations('internal.leadStatus')
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('contactLog')}</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noContacts')}</p>
        ) : (
          <ul className="space-y-4">
            {activities.map((a) => (
              <li key={a.id} className="space-y-1 border-s-2 border-flow-lime ps-3">
                <p className="text-sm font-medium">
                  {t(`method_${a.method}`)}
                  {a.status_after && (
                    <span className="ms-2 text-xs font-normal text-muted-foreground">→ {ts(a.status_after)}</span>
                  )}
                </p>
                {a.note && <p className="whitespace-pre-line text-sm text-muted-foreground">{a.note}</p>}
                <p className="text-xs text-muted-foreground">
                  {(a.created_by && names[a.created_by]) || '—'} · {format(new Date(a.created_at), 'PP p')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
