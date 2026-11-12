import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, CheckCircle2, ClipboardCheck, FileSignature, LifeBuoy, RefreshCw, Wallet, type LucideIcon } from 'lucide-react'
import type { NextStep, NextStepKind } from '@/lib/portal-next-step'
import { BorderBeam } from '@/components/ds/border-beam'
import { Button } from '@/components/ds/button'

const ICON: Record<NextStepKind, LucideIcon> = {
  sign_contract: FileSignature,
  fix_papers: RefreshCw,
  upload_papers: ClipboardCheck,
  pay_invoice: Wallet,
  reply_request: LifeBuoy,
  all_set: CheckCircle2,
}

/**
 * THE thing to do now: one sentence, one big button. When nothing is needed it
 * turns into a calm "you're all set" with what the team is doing.
 */
export async function NextStepCard({ step, allSetHelp }: { step: NextStep; allSetHelp: string }) {
  const t = await getTranslations('portal.home')
  const Icon = ICON[step.kind]
  const done = step.kind === 'all_set'

  return (
    <section
      aria-labelledby="next-step-title"
      className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-md)] sm:p-8"
    >
      <div className="flex items-start gap-4">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${done ? 'bg-flow-lime/50 text-flow-green' : 'bg-[var(--brand)]/12 text-[var(--brand-ink)]'}`}
        >
          <Icon className="h-7 w-7" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{done ? t('nowLabelDone') : t('nowLabel')}</p>
          <h2 id="next-step-title" className="mt-1 font-display text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
            {t(`step.${step.kind}.title`, { count: step.count })}
          </h2>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            {done ? allSetHelp : t(`step.${step.kind}.body`, { count: step.count })}
          </p>
        </div>
      </div>

      {!done && (
        <Button asChild size="lg" className="mt-6 h-14 w-full text-base sm:w-auto sm:px-10">
          <Link href={step.href}>
            {t(`step.${step.kind}.cta`)}
            <ArrowRight className="h-5 w-5 rtl:-scale-x-100" />
          </Link>
        </Button>
      )}

      {!done && <BorderBeam size={160} duration={9} borderWidth={2} colorFrom="var(--brand)" colorTo="#C4F075" />}
    </section>
  )
}
