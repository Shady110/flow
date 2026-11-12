import { getTranslations } from 'next-intl/server'
import { Gauge } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LeadCapInfo } from '@/lib/db/lead-queries'

/** "7 of 10 new clients this month" — turns amber at the limit. */
export async function LeadCapBanner({ info }: { info: LeadCapInfo }) {
  const t = await getTranslations('internal.leads')
  const full = info.won >= info.cap
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border p-3 text-sm',
        full ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-border bg-muted/30',
      )}
    >
      <Gauge className="h-4 w-4 shrink-0" />
      <p>
        <span className="font-medium">{t('capLine', { won: info.won, cap: info.cap })}</span>
        {info.blocked && <span className="ms-2">{t('capReached')}</span>}
      </p>
    </div>
  )
}
