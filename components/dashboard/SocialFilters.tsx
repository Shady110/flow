'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ds/select'
import { SOCIAL_PLATFORMS, SOCIAL_POST_STATUSES } from '@/lib/constants'
import type { SocialCampaign } from '@/lib/types'

const ALL = '__all__'

/**
 * Filters live in the URL so the server component does the filtering and a
 * filtered view can be shared — "everything still needing a design before
 * White Friday" is a link someone can send.
 */
export function SocialFilters({ campaigns }: { campaigns: SocialCampaign[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const t = useTranslations('internal.social')

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
      <Select value={params.get('platform') ?? ALL} onValueChange={(v) => apply({ platform: v })}>
        <SelectTrigger className="h-9 w-40" aria-label={t('platform')}>
          <SelectValue placeholder={t('platform')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('platform')}</SelectItem>
          {SOCIAL_PLATFORMS.map((p) => (
            <SelectItem key={p} value={p}>
              {t(`platformName.${p}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={params.get('status') ?? ALL} onValueChange={(v) => apply({ status: v })}>
        <SelectTrigger className="h-9 w-44" aria-label={t('status')}>
          <SelectValue placeholder={t('status')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('status')}</SelectItem>
          {SOCIAL_POST_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {t(`statusName.${s}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {campaigns.length > 0 && (
        <Select value={params.get('campaign') ?? ALL} onValueChange={(v) => apply({ campaign: v })}>
          <SelectTrigger className="h-9 w-52" aria-label={t('campaign')}>
            <SelectValue placeholder={t('campaign')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t('campaign')}</SelectItem>
            {campaigns.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
                {/* White Friday's window is announced late — say so here rather
                    than letting someone schedule against an invented date. */}
                {c.dates_provisional ? ` · ${t('provisional')}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
