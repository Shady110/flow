import { getLocale, getTranslations } from 'next-intl/server'
import { CheckCircle2 } from 'lucide-react'
import { requireClientContext } from '@/lib/auth/client-session'
import { getRequirements } from '@/lib/db/requirement-queries'
import { RequirementUpload } from '@/components/flow/RequirementUpload'
import { RequirementStatusBadge, ViewFileButton } from '@/components/flow/RequirementBits'

export default async function PortalDocumentsPage() {
  const { client } = await requireClientContext()
  const [docs, t, locale] = await Promise.all([
    getRequirements(client.id, { kind: 'client_document' }),
    getTranslations('portal.documents'),
    getLocale(),
  ])

  const needed = docs.filter((d) => d.required && d.status !== 'waived')
  const done = needed.filter((d) => d.status === 'submitted' || d.status === 'approved')
  const complete = needed.length > 0 && done.length === needed.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('intro')}</p>
      </div>

      {docs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <>
          <p className="flex items-center gap-2 text-sm font-medium">
            {complete && <CheckCircle2 className="h-4 w-4 text-flow-green" />}
            {t('progress', { done: done.length, total: needed.length })}
          </p>
          <ul className="space-y-3">
            {docs.map((d) => {
              const open = d.status === 'pending' || d.status === 'rejected'
              return (
                <li key={d.id} className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium">{locale === 'ar' && d.label_ar ? d.label_ar : d.label_en}</p>
                      {d.hint && <p className="mt-0.5 text-sm text-muted-foreground">{d.hint}</p>}
                      {!d.required && <p className="text-xs text-muted-foreground">{t('optional')}</p>}
                    </div>
                    <RequirementStatusBadge status={d.status} label={t(`status.${d.status}`)} />
                  </div>
                  {d.status === 'rejected' && (
                    <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      {d.note || t('rejectedNoNote')}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-1">
                    {d.file_path && <ViewFileButton requirementId={d.id} label={d.file_name ?? t('view')} />}
                    {d.status !== 'approved' && d.status !== 'waived' && (
                      <RequirementUpload
                        requirementId={d.id}
                        label={open && !d.file_path ? t('upload') : t('replace')}
                        done={t('uploaded')}
                      />
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
