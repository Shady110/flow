import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { CheckCircle2, ChevronRight, Circle, Clock, FileSignature, RefreshCw, type LucideIcon } from 'lucide-react'
import type { ClientRequirement, Contract } from '@/lib/types'
import { RequirementUpload } from '@/components/flow/RequirementUpload'
import { ViewFileButton } from '@/components/flow/RequirementBits'
import { AnimatedCircularProgressBar } from '@/components/ds/animated-circular-progress-bar'

const ICON: Record<string, LucideIcon> = { pending: Circle, rejected: RefreshCw, submitted: Clock, approved: CheckCircle2, waived: CheckCircle2 }

/** The client's Papers screen: contract door, progress ring, then papers grouped by what to do. */
export async function PapersView({ docs, contract }: { docs: ClientRequirement[]; contract: Contract | null }) {
  const [t, locale] = await Promise.all([getTranslations('portal.papers'), getLocale()])

  const todo = docs.filter((d) => d.status === 'pending' || d.status === 'rejected')
  const review = docs.filter((d) => d.status === 'submitted')
  const done = docs.filter((d) => d.status === 'approved' || d.status === 'waived')
  const required = docs.filter((d) => d.required && d.status !== 'waived')
  const sent = required.filter((d) => d.status === 'submitted' || d.status === 'approved').length
  const percent = required.length ? Math.round((sent / required.length) * 100) : 100

  const label = (d: ClientRequirement) => (locale === 'ar' && d.label_ar ? d.label_ar : d.label_en)

  const group = (title: string, items: ClientRequirement[], tone: 'todo' | 'wait' | 'done') =>
    items.length > 0 && (
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
        <ul className="space-y-3">
          {items.map((d) => {
            const Icon = ICON[d.status]
            return (
              <li key={d.id} className="space-y-4 rounded-3xl border border-border/60 bg-card p-4 shadow-[var(--shadow-xs)] sm:p-5">
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      tone === 'done' ? 'bg-flow-lime/50 text-flow-green' : tone === 'wait' ? 'bg-muted text-muted-foreground' : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold leading-snug">{label(d)}</p>
                    {d.hint && <p className="mt-0.5 text-base text-muted-foreground">{d.hint}</p>}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t(`status.${d.status}`)}
                      {!d.required && ` · ${t('optional')}`}
                    </p>
                  </div>
                </div>

                {d.status === 'rejected' && (
                  <p className="rounded-2xl bg-destructive/10 p-4 text-base text-destructive">{d.note || t('rejectedNoNote')}</p>
                )}

                {d.file_path && (
                  <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                    <span className="truncate">{t('sentFile', { name: d.file_name ?? '' })}</span>
                    <ViewFileButton requirementId={d.id} label={t('view')} />
                  </p>
                )}

                {d.status !== 'approved' && d.status !== 'waived' && (
                  <div>
                    <RequirementUpload large requirementId={d.id} label={d.file_path ? t('replace') : t('upload')} done={t('uploaded')} />
                    {tone === 'todo' && <p className="mt-2 text-center text-sm text-muted-foreground">{t('formatHint')}</p>}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-base text-muted-foreground">{t('intro')}</p>
      </div>

      {contract && (
        <Link
          href="/contract"
          className="flex min-h-20 items-center gap-4 rounded-3xl border border-border/60 bg-card p-4 shadow-[var(--shadow-xs)] transition-shadow hover:shadow-[var(--shadow-md)] sm:p-5"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)]/10 text-[var(--brand-ink)]">
            <FileSignature className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-bold">{t('contractTitle')}</span>
            <span className="block text-base text-muted-foreground">
              {contract.status === 'sent' ? t('contractSign') : t('contractSigned')}
            </span>
          </span>
          {contract.status === 'sent' && <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">{t('contractBadge')}</span>}
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
        </Link>
      )}

      {docs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-flow-green" />
          <p className="text-base text-muted-foreground">{t('empty')}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-5 rounded-3xl bg-secondary p-5">
            <AnimatedCircularProgressBar value={percent} gaugePrimaryColor="var(--brand)" gaugeSecondaryColor="var(--card)" className="size-20 text-xl" />
            <div>
              <p className="font-display text-xl font-bold">{t('progressTitle', { done: sent, total: required.length })}</p>
              <p className="text-base text-muted-foreground">{todo.length ? t('progressTodo', { count: todo.length }) : t('progressDone')}</p>
            </div>
          </div>
          {group(t('groupTodo'), todo, 'todo')}
          {group(t('groupReview'), review, 'wait')}
          {group(t('groupDone'), done, 'done')}
        </>
      )}
    </div>
  )
}
