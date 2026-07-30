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
  const [leads, team, user] = await Promise.all([getLeads(), getTeam(), getCurrentUser()])

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
        title="Leads"
        description="Every enquiry, from first contact to signed client."
        actions={canCreate ? <LeadDialog team={teamOptions} /> : undefined}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New" value={counts.new} icon={UserPlus} href="/leads" />
        <StatCard label="In the pipeline" value={inPlay} icon={PhoneCall} />
        <StatCard label="Won" value={counts.won} icon={Trophy} tone={counts.won ? 'success' : 'default'} />
        <StatCard label="Lost" value={counts.lost} icon={Trophy} tone={counts.lost ? 'danger' : 'default'} />
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Field</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No leads yet. Add one, or wait for the next website enquiry.
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
                  {l.owner_id ? (ownerName.get(l.owner_id) ?? '—') : 'Unassigned'}
                </TableCell>
                <TableCell>
                  <LeadStatusBadge status={l.status} />
                  {l.converted_client_id && (
                    <span className="ms-2 text-xs text-muted-foreground">client created</span>
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
