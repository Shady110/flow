import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { formatMoney } from '@/lib/money'
import type { ClientRow } from '@/lib/overview-trends'
import { Panel } from '@/components/dashboard/Panel'
import { cn } from '@/lib/utils'

const DOT = { late: 'bg-destructive', review: 'bg-flow-green-light', risk: 'bg-warning', ok: 'bg-success' }

/** Every client by name: where they are, what they owe, and why they need you. Worst first. */
export async function ClientsTable({ rows, currency }: { rows: ClientRow[]; currency: string }) {
  const [t, tf] = await Promise.all([getTranslations('internal.overview'), getTranslations('internal.flow')])
  const status = (r: ClientRow) =>
    r.status === 'late' ? t('statusLate', { days: r.lateDays }) : r.status === 'review' ? t('statusReview') : r.status === 'risk' ? t('statusRisk') : t('statusOk')
  return (
    <Panel title={t('clientsTitle')} description={t('clientsDescription')}>
      {rows.length === 0 ? (
        <p className="rounded-2xl bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">{t('clientsEmpty')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="text-start text-xs text-muted-foreground">
                <th className="py-2 pe-3 text-start font-normal">{t('colClient')}</th>
                <th className="py-2 pe-3 text-start font-normal">{t('colStage')}</th>
                <th className="py-2 pe-3 text-start font-normal">{t('colOwes')}</th>
                <th className="py-2 text-start font-normal">{t('colStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/70 transition-colors hover:bg-muted/40">
                  <td className="py-3 pe-3">
                    <Link href={`/clients/${r.id}`} className="font-medium hover:underline">{r.name}</Link>
                  </td>
                  <td className="py-3 pe-3 text-muted-foreground">{tf(`stage.${r.stage}`)}</td>
                  <td className="py-3 pe-3">{r.owed > 0 ? <bdi dir="ltr" className="font-display font-semibold">{formatMoney(r.owed, currency, 0)}</bdi> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className={cn('h-2 w-2 rounded-full', DOT[r.status])} />
                      <span className={cn(r.status === 'ok' ? 'text-muted-foreground' : 'text-foreground')}>{status(r)}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}
