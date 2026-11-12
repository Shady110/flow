'use client'

import { useLocale, useTranslations } from 'next-intl'
import { RequirementUpload } from '@/components/flow/RequirementUpload'
import { RequirementStatusBadge, ViewFileButton } from '@/components/flow/RequirementBits'
import type { ClientRequirement } from '@/lib/types'

/** The files Content must hand in before an account can be pushed. */
export function DeliverablesPanel({ items }: { items: ClientRequirement[] }) {
  const locale = useLocale()
  const t = useTranslations('internal.requirements')

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {items.map((r) => (
        <li key={r.id} className="space-y-2 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{locale === 'ar' && r.label_ar ? r.label_ar : r.label_en}</span>
            {!r.required && <span className="text-xs text-muted-foreground">{t('optional')}</span>}
            <RequirementStatusBadge status={r.status} label={t(`status.${r.status}`)} />
          </div>
          {r.hint && <p className="text-xs text-muted-foreground">{r.hint}</p>}
          {r.status === 'rejected' && r.note && <p className="text-xs text-destructive">{r.note}</p>}
          <div className="flex flex-wrap items-center gap-1">
            {r.file_path && <ViewFileButton requirementId={r.id} label={r.file_name ?? t('view')} />}
            {r.status !== 'approved' && r.status !== 'waived' && (
              <RequirementUpload requirementId={r.id} label={r.file_path ? t('replace') : t('upload')} />
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
