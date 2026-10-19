import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { requirePermission } from '@/lib/auth/session'
import { getClients, getTeam } from '@/lib/db/queries'
import { getLeads } from '@/lib/db/lead-queries'
import { getPlatforms } from '@/lib/db/flow-queries'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { PipelineBoard } from '@/components/flow/PipelineBoard'

export default async function PipelinePage() {
  await requirePermission('pipeline.manage')
  const [clients, platforms, leads, team, t] = await Promise.all([
    getClients(),
    getPlatforms(),
    getLeads(),
    getTeam(),
    getTranslations('internal.flow'),
  ])

  const clientById = new Map(clients.map((c) => [c.id, c]))
  const teamName = new Map(team.map((m) => [m.id, m.full_name ?? '—']))
  const platformsOf = (id: string) => platforms.filter((p) => p.client_id === id)

  // Platform cards only exist for onboarded clients; before that the client is one card.
  const boardPlatforms = platforms
    .filter((p) => clientById.get(p.client_id)?.stage === 'onboarded')
    .map((p) => ({
      id: p.id,
      client_id: p.client_id,
      client_name: clientById.get(p.client_id)?.name ?? '—',
      platform: p.platform,
      stage: p.stage,
      stages: p.stages,
      am: p.account_manager_id ? (teamName.get(p.account_manager_id) ?? null) : null,
    }))

  const noPlatform = clients.filter(
    (c) => c.stage === 'onboarded' && c.status !== 'churned' && platformsOf(c.id).length === 0,
  )

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />

      {noPlatform.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {t('onboardedNoPlatform')}{' '}
          {noPlatform.map((c, i) => (
            <span key={c.id}>
              {i > 0 && ', '}
              <Link href={`/clients/${c.id}`} className="font-medium text-foreground hover:underline">
                {c.name}
              </Link>
            </span>
          ))}
        </p>
      )}

      <PipelineBoard
        leads={leads
          .filter((l) => l.status !== 'won' && l.status !== 'lost')
          .map((l) => ({ id: l.id, name: l.name, company: l.company, status: l.status }))}
        clients={clients.map((c) => ({
          id: c.id,
          name: c.name,
          stage: c.stage,
          platforms: platformsOf(c.id).map((p) => p.platform),
        }))}
        platforms={boardPlatforms}
      />
    </div>
  )
}
