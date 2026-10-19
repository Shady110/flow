import { getTranslations } from 'next-intl/server'
import { formatMoney } from '@/lib/money'
import type { CeoOverview } from '@/lib/db/overview-queries'
import { Panel } from '@/components/dashboard/Panel'
import { HatchBar } from '@/components/dashboard/HatchBar'
import { GroupedBars } from '@/components/dashboard/charts'

/** Cash in, cash owed, six months of revenue vs expenses, and budget vs expected cost. */
export async function MoneyPanel({ finance, budget }: Pick<CeoOverview, 'finance' | 'budget'>) {
  const t = await getTranslations('internal.overview')
  const cur = finance.currency
  const fmt = (n: number) => formatMoney(n, cur, 0)

  return (
    <Panel title={t('moneyTitle')} description={t('moneyDescription')}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,260px)_1fr]">
        <div className="space-y-5">
          <div>
            <p className="text-xs text-muted-foreground">{t('revenueMonth')}</p>
            <p className="font-display text-3xl font-bold leading-tight">{fmt(finance.revenueThisMonth)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('outstanding')}</p>
            <p className="font-display text-3xl font-bold leading-tight text-warning">{fmt(finance.outstanding)}</p>
          </div>
          <div className="space-y-2 rounded-2xl bg-muted/60 p-4">
            <div className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
              <span>{t('budgetVsCost')}</span>
              {budget.marginPct !== null && <span className="font-medium text-flow-green">{t('margin', { pct: budget.marginPct })}</span>}
            </div>
            <HatchBar value={budget.cost} max={budget.budget} tone={budget.cost > budget.budget ? 'danger' : 'green'} />
            <div className="flex justify-between text-xs">
              <span>{t('estCost', { amount: fmt(budget.cost) })}</span>
              <span className="text-muted-foreground">{t('budget', { amount: fmt(budget.budget) })}</span>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-2 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-flow-green" />{t('revenue')}</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-flow-lime" />{t('expenses')}</span>
          </div>
          <GroupedBars
            data={finance.monthly}
            bars={[
              { key: 'Revenue', color: '#143C28', label: t('revenue') },
              { key: 'Expenses', color: '#C4F075', label: t('expenses') },
            ]}
          />
        </div>
      </div>
    </Panel>
  )
}
