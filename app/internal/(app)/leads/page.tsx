import { getTranslations } from 'next-intl/server'
import { requirePermission, getCurrentUser } from '@/lib/auth/session'
import { getLeads } from '@/lib/db/lead-queries'
import { getTeam } from '@/lib/db/queries'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { LeadDialog } from '@/components/dashboard/LeadDialog'
import { LinkedTableRow } from '@/components/dashboard/LinkedTableRow'
import { LeadStatusBadge } from '@/components/dashboard/indicators'
import { LEAD_STATUSES } from '@/lib/constants'
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

export default async function LeadsPage() {
  await requirePermission('leads.view')
  const [leads, team, user, t, tc] = await Promise.all([
    getLeads(),
    getTeam(),
    getCurrentUser(),
    getTranslations('internal.leads'),
    getTranslations('internal.common'),
  ])

  const teamOptions = team.map((m) => ({ id: m.id, label: m.full_name ?? m.id }))
  const ownerName = new Map(team.map((m) => [m.id, m.full_name ?? '—']))
  const canCreate = !!user?.permissions.has('leads.create')

  const counts = Object.fromEntries(
    LEAD_STATUSES.map((s) => [s, leads.filter((l) => l.status === s).length]),
  ) as Record<(typeof LEAD_STATUSES)[number], number>
  const inPlay = leads.filter((l) => !['won', 'lost'].includes(l.status)).length

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={canCreate ? <LeadDialog team={teamOptions} /> : undefined}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('statNew')} value={counts.new} icon={UserPlus} href="/leads" />
        <StatCard label={t('statPipeline')} value={inPlay} icon={PhoneCall} />
        <StatCard label={t('statWon')} value={counts.won} icon={Trophy} tone={counts.won ? 'success' : 'default'} />
        <StatCard label={t('statLost')} value={counts.lost} icon={Trophy} tone={counts.lost ? 'danger' : 'default'} />
      </div>

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
                  {t('noLeads')}
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
    </div>
  )
}
