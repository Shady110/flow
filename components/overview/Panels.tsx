import { getTranslations } from 'next-intl/server'
import { PIPELINE_COLUMNS, type WorkloadRow } from '@/lib/overview'
import type { CeoOverview } from '@/lib/db/overview-queries'
import { Panel } from '@/components/dashboard/Panel'
import { PipelineFlow } from '@/components/overview/PipelineFlow'
import { RankBars } from '@/components/overview/RankBars'

/** The pipeline as a flow, optionally cut down to the stages a department cares about. */
export async function PipelinePanel({ counts, stages = [...PIPELINE_COLUMNS] }: { counts: CeoOverview['pipeline']; stages?: (typeof PIPELINE_COLUMNS)[number][] }) {
  const [t, tf] = await Promise.all([getTranslations('internal.overview'), getTranslations('internal.flow')])
  return (
    <Panel title={t('flowLabel')} description={t('pipelineDescription')}>
      <PipelineFlow label={t('flowLabel')} steps={stages.map((c) => ({ key: c, label: tf(`stage.${c}`), count: counts[c] }))} />
    </Panel>
  )
}

/** Average days accounts spend in each stage. */
export async function DwellPanel({ dwell, stages = [...PIPELINE_COLUMNS] }: { dwell: CeoOverview['trends']['dwell']; stages?: (typeof PIPELINE_COLUMNS)[number][] }) {
  const [t, tf] = await Promise.all([getTranslations('internal.overview'), getTranslations('internal.flow')])
  return (
    <Panel title={t('dwellTitle')} className="h-full">
      <RankBars
        empty={t('dwellEmpty')}
        rows={stages.filter((c) => dwell[c] !== undefined).map((c) => ({ label: tf(`stage.${c}`), value: dwell[c], display: t('days', { count: dwell[c] }), tone: 'green' as const }))}
      />
    </Panel>
  )
}

/** What each person is carrying in one area (leads, accounts, tickets, tasks), biggest first. Rows with nothing are left out. */
export async function WorkloadBars({ rows, field, title }: { rows: WorkloadRow[]; field: 'leads' | 'accounts' | 'tickets' | 'tasks' | 'contentQueue'; title: string }) {
  const t = await getTranslations('internal.overview')
  return (
    <Panel title={title} className="h-full">
      <RankBars
        empty={t('workloadEmpty')}
        rows={rows.filter((r) => r[field] > 0).sort((a, b) => b[field] - a[field]).map((r) => ({ label: r.name, value: r[field], tone: 'green' as const }))}
      />
    </Panel>
  )
}
