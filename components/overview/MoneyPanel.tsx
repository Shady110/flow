import { getTranslations } from 'next-intl/server'
import { formatMoney } from '@/lib/money'
import type { CeoOverview } from '@/lib/db/overview-queries'
import { Panel } from '@/components/dashboard/Panel'
import { HatchBar } from '@/components/dashboard/HatchBar'
import { AnimatedCircularProgressBar } from '@/components/ds/animated-circular-progress-bar'
import { RankBars } from '@/components/overview/RankBars'

/** Cash in and owed: revenue vs expenses as areas, a collection ring, what is owed by lateness, and budget vs expected cost. */
export async function MoneyPanel({ finance, budget, aging }: Pick<CeoOverview, 'finance' | 'budget'> & { aging: CeoOverview['trends']['aging'] }) {
  const t = await getTranslations('internal.overview')
  const cur = finance.currency
  const fmt = (n: number) => formatMoney(n, cur, 0)
  const billed = finance.revenue + finance.outstanding
  const collected = billed > 0 ? Math.round((finance.revenue / billed) * 100) : 0

  return (
    <Panel title={t('moneyTitle')} description={t('moneyDescription')}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,260px)_1fr]">
        <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-start">
          <AnimatedCircularProgressBar value={collected} gaugePrimaryColor="#143C28" gaugeSecondaryColor="rgba(20,60,40,0.12)" className="size-28 text-xl" />
          <p className="text-xs text-muted-foreground">{t('collectionRate')}</p>
          <div>
            <p className="text-xs text-muted-foreground">{t('revenueMonth')}</p>
            <p className="font-display text-2xl font-bold leading-tight">{fmt(finance.revenueThisMonth)}</p>
          </div>
          <div className="w-full space-y-2 rounded-2xl bg-muted/60 p-3 text-start">
            <div className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
              <span>{t('budgetVsCost')}</span>
              {budget.marginPct !== null && <span className="font-medium text-flow-green">{t('margin', { pct: budget.marginPct })}</span>}
            </div>
            <HatchBar value={budget.cost} max={budget.budget} tone={budget.cost > budget.budget ? 'danger' : 'green'} />
          </div>
        </div>
        <div>
          <h3 className="font-display text-base font-bold">{t('agingTitle')}</h3>
          <p className="mb-3 text-xs text-muted-foreground">{t('agingDescription')}</p>
          <RankBars
            empty={t('agingEmpty')}
            rows={[
              { label: t('agingCurrent'), value: aging.current, display: fmt(aging.current), tone: 'green' },
              { label: t('aging1to7'), value: aging.late1to7, display: fmt(aging.late1to7), tone: 'lime' },
              { label: t('aging8to14'), value: aging.late8to14, display: fmt(aging.late8to14), tone: 'warning' },
              { label: t('aging15plus'), value: aging.late15plus, display: fmt(aging.late15plus), tone: 'danger' },
            ]}
          />
        </div>
      </div>
    </Panel>
  )
}
