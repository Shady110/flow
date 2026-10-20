import { getTranslations } from 'next-intl/server'
import { AnimatedCircularProgressBar } from '@/components/ds/animated-circular-progress-bar'
import { ProgressSteps, type ProgressStep } from '@/components/portal/ProgressSteps'

/**
 * "How far along am I": a ring with the overall percent, then the steps in plain
 * words — onboarding first, one list per marketplace once onboarded.
 */
export async function JourneyCard({
  percent,
  tracks,
}: {
  percent: number
  tracks: { title: string | null; steps: ProgressStep[]; current: string }[]
}) {
  const t = await getTranslations('portal.home')
  return (
    <section className="rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-xs)] sm:p-6">
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <AnimatedCircularProgressBar
            value={percent}
            gaugePrimaryColor="var(--brand)"
            gaugeSecondaryColor="var(--muted)"
            className="size-24 text-2xl"
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-3.5 text-center text-xs text-muted-foreground">%</span>
        </div>
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">{t('journeyTitle')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('journeyHelp', { percent })}</p>
        </div>
      </div>
      <div className="mt-6 space-y-6">
        {tracks.map((tr, i) => (
          <div key={i}>
            {tr.title && <p className="mb-3 text-sm font-semibold">{tr.title}</p>}
            <ProgressSteps steps={tr.steps} current={tr.current} />
          </div>
        ))}
      </div>
    </section>
  )
}
