'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LayoutGrid, List, Search } from 'lucide-react'
import { Input } from '@/components/ds/input'
import { Button } from '@/components/ds/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ds/select'
import { LEAD_STATUSES, UNASSIGNED_OWNER } from '@/lib/constants'
import { cn } from '@/lib/utils'

const ALL = '__all__'

/**
 * Filters live in the URL so the server component does the filtering and a
 * filtered view can be shared or bookmarked.
 */
export function LeadsFilters({
  team,
  view,
}: {
  team: { id: string; label: string }[]
  view: 'table' | 'board'
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const t = useTranslations('internal.leads')
  const ts = useTranslations('internal.leadStatus')
  const tc = useTranslations('internal.common')
  const [q, setQ] = useState(params.get('q') ?? '')

  function apply(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '' || v === ALL) next.delete(k)
      else next.set(k, v)
    }
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          apply({ q })
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onBlur={() => apply({ q })}
          placeholder={tc('search')}
          className="h-9 w-48 ps-8"
          aria-label={tc('search')}
        />
      </form>

      <Select value={params.get('owner') ?? ALL} onValueChange={(v) => apply({ owner: v })}>
        <SelectTrigger className="h-9 w-40" aria-label={t('owner')}>
          <SelectValue placeholder={t('owner')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('owner')}</SelectItem>
          <SelectItem value={UNASSIGNED_OWNER}>{tc('unassigned')}</SelectItem>
          {team.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status is the board's own axis, so only offer it on the table. */}
      {view === 'table' && (
        <Select value={params.get('status') ?? ALL} onValueChange={(v) => apply({ status: v })}>
          <SelectTrigger className="h-9 w-40" aria-label={t('status')}>
            <SelectValue placeholder={t('status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t('status')}</SelectItem>
            {LEAD_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {ts(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex overflow-hidden rounded-lg border border-border">
        {(['table', 'board'] as const).map((v) => {
          const Icon = v === 'table' ? List : LayoutGrid
          return (
            <Button
              key={v}
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={view === v}
              onClick={() => apply({ view: v === 'table' ? null : v, status: v === 'board' ? null : params.get('status') })}
              className={cn('rounded-none px-3', view === v && 'bg-secondary text-secondary-foreground')}
            >
              <Icon className="h-4 w-4" />
              {t(v === 'table' ? 'viewTable' : 'viewBoard')}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
