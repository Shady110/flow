import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { CheckCircle2, ClipboardCheck, Camera, FileSignature, FileText, LifeBuoy, ListChecks, type LucideIcon } from 'lucide-react'
import type { AttentionItem, AttentionKind } from '@/lib/overview'
import { Panel } from '@/components/dashboard/Panel'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { cn } from '@/lib/utils'

const ICON: Record<AttentionKind, LucideIcon> = {
  contract_unsigned: FileSignature,
  documents_to_review: ClipboardCheck,
  listing_stuck: Camera,
  ticket_urgent: LifeBuoy,
  ticket_unassigned: LifeBuoy,
  invoice_overdue: FileText,
  task_overdue: ListChecks,
}
const DOT = { high: 'bg-destructive', medium: 'bg-warning', low: 'bg-muted-foreground/40' }

/** The short list of things that are stuck or waiting on the CEO, worst first. */
export async function AttentionFeed({
  items,
  clientNames,
}: {
  items: AttentionItem[]
  clientNames: Record<string, string>
}) {
  const t = await getTranslations('internal.overview')
  return (
    <Panel title={t('attentionTitle')} description={t('attentionDescription')} className="h-full">
      {items.length === 0 ? (
        <EmptyState icon={CheckCircle2} text={t('allClear')} />
      ) : (
        <ul className="space-y-1">
          {items.map((it, i) => {
            const Icon = ICON[it.kind]
            return (
              <li key={`${it.kind}-${i}`}>
                <Link href={it.href} className="flex items-start gap-3 rounded-2xl p-2.5 transition-colors hover:bg-muted/60">
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-flow-green">
                    <Icon className="h-[18px] w-[18px]" />
                    <span className={cn('absolute -end-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-card', DOT[it.severity])} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-snug">
                      {t(`attention.${it.kind}`, { client: (it.clientId && clientNames[it.clientId]) || '—', detail: it.detail, count: Number(it.detail) || 0 })}
                    </span>
                    {it.ageDays > 0 && (
                      <span className="mt-0.5 block text-xs text-muted-foreground">{t('age', { days: it.ageDays })}</span>
                    )}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
