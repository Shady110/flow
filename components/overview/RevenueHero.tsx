import { getTranslations } from 'next-intl/server'
import { formatMoney } from '@/lib/money'
import { changeVsLast } from '@/lib/overview-trends'
import type { CeoOverview } from '@/lib/db/overview-queries'
import { ColumnChart } from '@/components/dashboard/Columns'
import { BorderBeam } from '@/components/ds/border-beam'
import { NumberTicker } from '@/components/ds/number-ticker'

/** The big deep-green card: this month's revenue, the change against last month, and six months of columns. */
export async function RevenueHero({ finance }: { finance: CeoOverview['finance'] }) {
  const t = await getTranslations('internal.overview')
  const { delta, pct } = changeVsLast(finance.monthly.map((m) => m.Revenue))
  return (
    <section className="relative overflow-hidden rounded-3xl p-5 text-white shadow-[var(--shadow-md)] sm:p-6" style={{ background: 'var(--gradient-dark-panel)' }}>
      <BorderBeam size={110} duration={10} borderWidth={1.5} colorFrom="#C4F075" colorTo="#2E6B45" />
      <p className="text-sm text-flow-lime">{t('revenueMonth')}</p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-display text-4xl font-bold leading-tight sm:text-5xl">
        <span>
          {finance.currency} <bdi dir="ltr"><NumberTicker value={Math.round(finance.revenueThisMonth)} /></bdi>
        </span>
        {pct !== null && (
          <span className="text-sm font-medium text-flow-lime">{t('vsLastMonth', { pct: `${delta >= 0 ? '+' : ''}${pct}` })}</span>
        )}
      </p>
      <div className="mt-5">
        <ColumnChart
          tone="dark"
          height={200}
          data={finance.monthly}
          label={t('trendRevenue')}
          empty={t('moneyEmpty')}
          format={(n) => formatMoney(n, finance.currency, 0).replace(/^[^\d-]+\s?/, '')}
          series={[{ key: 'Revenue', color: '#C4F075', soft: '#2E6B45', label: t('revenue') }]}
        />
      </div>
    </section>
  )
}

