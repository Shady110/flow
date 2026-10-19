import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { PIPELINE_COLUMNS, type PipelineColumn } from '@/lib/overview'
import { Panel } from '@/components/dashboard/Panel'
import { cn } from '@/lib/utils'

// One colour per stage, pale → deep, so the bar reads left to right as "closer to live".
const TONE: Record<PipelineColumn, string> = {
  lead: 'hatch bg-muted',
  group_created: 'bg-flow-bg-muted',
  paperwork: 'bg-flow-lime/60',
  platform_creation: 'bg-flow-lime',
  listing: 'bg-flow-green-light',
  pushing: 'bg-flow-green',
  managing: 'bg-flow-green-deep',
}

/** Every stage at a glance: a proportional bar over seven tiles that link to the board. */
export async function PipelineStrip({ counts }: { counts: Record<PipelineColumn, number> }) {
  const t = await getTranslations('internal.overview')
  const tf = await getTranslations('internal.flow')
  const total = PIPELINE_COLUMNS.reduce((s, c) => s + counts[c], 0)

  return (
    <Panel
      title={t('pipelineTitle')}
      description={t('pipelineDescription')}
      action={
        <Link href="/pipeline" className="shrink-0 whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
          {t('openBoard')}
        </Link>
      }
    >
      {total === 0 ? (
        <p className="rounded-xl bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">{t('pipelineEmpty')}</p>
      ) : (
        <>
          <div className="flex h-3 gap-1 overflow-hidden rounded-full" aria-hidden>
            {PIPELINE_COLUMNS.filter((c) => counts[c] > 0).map((c) => (
              <div key={c} className={cn('h-full rounded-full', TONE[c])} style={{ flexGrow: counts[c], flexBasis: 0, minWidth: 10 }} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
            {PIPELINE_COLUMNS.map((c) => (
              <Link
                key={c}
                href="/pipeline"
                className="group rounded-2xl bg-muted/60 p-3 transition-colors hover:bg-secondary"
              >
                <span className={cn('block h-1.5 w-8 rounded-full', TONE[c])} />
                <p className="mt-3 font-display text-3xl font-bold leading-none">{counts[c]}</p>
                <p className="mt-1.5 text-xs leading-tight text-muted-foreground">{tf(`stage.${c}`)}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </Panel>
  )
}
