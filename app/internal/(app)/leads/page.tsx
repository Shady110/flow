import { getTranslations } from 'next-intl/server'
import { requirePermission, getCurrentUser } from '@/lib/auth/session'
import { getLeads, getLeadCapInfo } from '@/lib/db/lead-queries'
import { LeadCapBanner } from '@/components/leads/LeadCapBanner'
import { getTeam } from '@/lib/db/queries'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { LeadDialog } from '@/components/dashboard/LeadDialog'
import { LinkedTableRow } from '@/components/dashboard/LinkedTableRow'
import { LeadStatusBadge } from '@/components/dashboard/indicators'
import { LeadsBoard } from '@/components/dashboard/LeadsBoard'
import { LeadsFilters } from '@/components/dashboard/LeadsFilters'
import { LEAD_STATUSES } from '@/lib/constants'
import type { LeadStatus } from '@/lib/types'
import { Card } from '@/components/ds/card'
import { StatCard } from '@/components/dashboard/StatCard'
import { UserPlus, PhoneCall, Trophy } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ds/table'

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; owner?: string; status?: string; q?: string }>
}) {
  await requirePermission('leads.view')
  const sp = await searchParams
  const view = sp.view === 'board' ? 'board' : 'table'
  const status = LEAD_STATUSES.includes(sp.status as LeadStatus)
    ? (sp.status as LeadStatus)
    : undefined

  const [leads, allLeads, team, user, t, tc] = await Promise.all([
    // Filtered rows for the list/board…
    getLeads({ ownerId: sp.owner, status, q: sp.q }),
    // …and the unfiltered set, so the stat cards keep showing the whole pipeline.
    getLeads(),
    getTeam(),
    getCurrentUser(),
    getTranslations('internal.leads'),
    getTranslations('internal.common'),
  ])

  const cap = await getLeadCapInfo(!!user?.permissions.has('pipeline.manage'))
  const teamOptions = team.map((m) => ({ id: m.id, label: m.full_name ?? m.id }))
  const ownerName = new Map(team.map((m) => [m.id, m.full_name ?? '—']))
  const canCreate = !!user?.permissions.has('leads.create')
  const canEdit = !!user?.permissions.has('leads.edit')
  const filtered = leads.length !== allLeads.length

  const counts = Object.fromEntries(
    LEAD_STATUSES.map((s) => [s, allLeads.filter((l) => l.status === s).length]),
  ) as Record<(typeof LEAD_STATUSES)[number], number>
  const inPlay = allLeads.filter((l) => !['won', 'lost'].includes(l.status)).length

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={canCreate ? <LeadDialog team={teamOptions} /> : undefined}
      />

      <LeadCapBanner info={cap} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('statNew')} value={counts.new} icon={UserPlus} href="/leads" />
        <StatCard label={t('statPipeline')} value={inPlay} icon={PhoneCall} />
        <StatCard label={t('statWon')} value={counts.won} icon={Trophy} tone={counts.won ? 'success' : 'default'} />
        <StatCard label={t('statLost')} value={counts.lost} icon={Trophy} tone={counts.lost ? 'danger' : 'default'} />
      </div>

      <LeadsFilters team={teamOptions} view={view} />

      {view === 'board' ? (
        <LeadsBoard
          leads={leads}
          ownerNames={Object.fromEntries(ownerName)}
          canEdit={canEdit}
          capBlocked={cap.blocked}
        />
      ) : (
      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('lead')}</TableHead>
              <TableHead>{t('contact')}</TableHead>
              <TableHead>{t('area')}</TableHead>
              <TableHead>{t('field')}</TableHead>
              <TableHead>{t('owner')}</TableHead>
              <TableHead>{t('status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  {filtered ? t('noMatches') : t('noLeads')}
                </TableCell>
              </TableRow>
            )}
            {leads.map((l) => (
              <LinkedTableRow key={l.id} href={`/leads/${l.id}`}>
                <TableCell>
                  <span className="font-medium">{l.name}</span>
                  {l.company && (
                    <span className="block text-xs text-muted-foreground">{l.company}</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {l.phone || l.email || '—'}
                </TableCell>
                <TableCell className="text-muted-foreground">{l.area || '—'}</TableCell>
                <TableCell className="text-muted-foreground">{l.field || '—'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {l.owner_id ? (ownerName.get(l.owner_id) ?? '—') : tc('unassigned')}
                </TableCell>
                <TableCell>
                  <LeadStatusBadge status={l.status} />
                  {l.converted_client_id && (
                    <span className="ms-2 text-xs text-muted-foreground">{t('clientCreated')}</span>
                  )}
                </TableCell>
              </LinkedTableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      )}
    </div>
  )
}
