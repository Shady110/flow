import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { requirePermission, getCurrentUser } from '@/lib/auth/session'
import { getLead } from '@/lib/db/lead-queries'
import { getClient, getTeam } from '@/lib/db/queries'
import { LeadDialog } from '@/components/dashboard/LeadDialog'
import { LeadStatusSelect } from '@/components/dashboard/LeadStatusSelect'
import { ConvertLeadDialog } from '@/components/dashboard/ConvertLeadDialog'
import { ConfirmDelete } from '@/components/dashboard/ConfirmDelete'
import { deleteLeadAction } from '@/lib/db/lead-actions'
import { LeadStatusBadge } from '@/components/dashboard/indicators'
import { Button } from '@/components/ds/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm">{children || '—'}</div>
    </div>
  )
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>
}) {
  await requirePermission('leads.view')
  const { leadId } = await params
  const [lead, team, user] = await Promise.all([getLead(leadId), getTeam(), getCurrentUser()])
  if (!lead) notFound()

  const client = lead.converted_client_id ? await getClient(lead.converted_client_id) : null
  const teamOptions = team.map((m) => ({ id: m.id, label: m.full_name ?? m.id }))
  const ownerName = lead.owner_id
    ? (team.find((m) => m.id === lead.owner_id)?.full_name ?? '—')
    : 'Unassigned'
  const canEdit = !!user?.permissions.has('leads.edit')
  const canDelete = !!user?.permissions.has('leads.delete')
  const canConvert = !!user?.permissions.has('leads.convert')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/leads"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Back to leads
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && <LeadStatusSelect leadId={lead.id} status={lead.status} />}
          {canEdit && (
            <LeadDialog
              team={teamOptions}
              lead={lead}
              trigger={<Button variant="outline">Edit</Button>}
            />
          )}
          {canConvert && !client && <ConvertLeadDialog lead={lead} />}
          {canDelete && (
            <ConfirmDelete
              action={deleteLeadAction}
              args={[lead.id]}
              title={`Delete “${lead.name}”?`}
              description="The lead and its notes are removed. Any client already created from it is kept."
              successMessage="Lead deleted"
              redirectTo="/leads"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-xl">{lead.name}</CardTitle>
                {lead.company && (
                  <p className="text-sm text-muted-foreground">{lead.company}</p>
                )}
              </div>
              <LeadStatusBadge status={lead.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              <Field label="Email">
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} className="hover:underline">
                    {lead.email}
                  </a>
                ) : null}
              </Field>
              <Field label="Phone">
                {lead.phone ? (
                  <a href={`tel:${lead.phone}`} className="hover:underline">
                    {lead.phone}
                  </a>
                ) : null}
              </Field>
              <Field label="Owner">{ownerName}</Field>
              <Field label="Area">{lead.area}</Field>
              <Field label="Field">{lead.field}</Field>
              <Field label="Interested in">{lead.plan_interest}</Field>
              <Field label="Source">{lead.source}</Field>
              <Field label="Added">
                {new Date(lead.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Field>
            </div>
            <Field label="Address">{lead.address}</Field>
            {lead.notes && (
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Notes
                </p>
                <p className="whitespace-pre-line text-sm text-muted-foreground">{lead.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {client ? (
              <>
                <p className="text-muted-foreground">This lead became a client.</p>
                <Link
                  href={`/clients/${client.id}`}
                  className="inline-flex items-center gap-1.5 font-medium hover:underline"
                >
                  {client.name} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <p className="text-xs text-muted-foreground">{client.slug}.flow…</p>
              </>
            ) : (
              <p className="text-muted-foreground">
                Not a client yet. Converting creates the client record, their portal login, and marks
                this lead won.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
