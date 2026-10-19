import { getTranslations } from 'next-intl/server'
import type { WorkloadRow } from '@/lib/overview'
import { Panel } from '@/components/dashboard/Panel'
import { HatchBar } from '@/components/dashboard/HatchBar'
import { PersonAvatar } from '@/components/dashboard/PersonAvatar'

const pretty = (role: string | null) =>
  role ? role.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()) : ''

/** What each person is carrying right now; the bar is relative to the busiest. */
export async function WorkloadPanel({ rows }: { rows: WorkloadRow[] }) {
  const t = await getTranslations('internal.overview')
  const max = Math.max(1, ...rows.map((r) => r.total))
  return (
    <Panel title={t('workloadTitle')} description={t('workloadDescription')} className="h-full">
      <ul className="space-y-4">
        {rows.map((r) => {
          const parts = [
            r.leads && t('wLeads', { count: r.leads }),
            r.contentQueue && t('wContent', { count: r.contentQueue }),
            r.accounts && t('wAccounts', { count: r.accounts }),
            r.tickets && t('wTickets', { count: r.tickets }),
            r.tasks && t('wTasks', { count: r.tasks }),
          ].filter(Boolean)
          return (
            <li key={r.id} className="flex items-center gap-3">
              <PersonAvatar name={r.name} />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-medium">
                    {r.name} <span className="font-normal text-muted-foreground">· {pretty(r.role)}</span>
                  </p>
                  <span className="font-display text-sm font-bold">{r.total}</span>
                </div>
                <HatchBar value={r.total} max={max} />
                <p className="truncate text-xs text-muted-foreground">{parts.length ? parts.join(' · ') : t('wNothing')}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
