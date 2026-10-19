'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowUpRight } from 'lucide-react'

/**
 * Dark card pinned to the bottom of the sidebar: how many new clients this
 * month against the CEO's cap. Lime = closed so far, hatched = room left.
 */
export function CapCard({ won, cap }: { won: number; cap: number }) {
  const t = useTranslations('internal.shell')
  const pct = cap > 0 ? Math.min(100, Math.round((won / cap) * 100)) : 100
  return (
    <Link
      href="/leads"
      className="group relative block overflow-hidden rounded-2xl p-3.5 text-white"
      style={{ background: 'var(--gradient-dark-panel)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-white/70">{t('capTitle')}</p>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-flow-lime group-hover:text-flow-green">
          <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
        </span>
      </div>
      <p className="mt-1.5 font-display text-2xl font-bold leading-none">
        <bdi dir="ltr">
          {won}
          <span className="text-lg font-medium text-white/60"> / {cap}</span>
        </bdi>
      </p>
      <div className="hatch-on-dark mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-flow-lime" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-white/60">
        {won >= cap ? t('capFull') : t('capLeft', { count: cap - won })}
      </p>
    </Link>
  )
}
