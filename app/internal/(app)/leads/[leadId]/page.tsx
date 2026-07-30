import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
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
  const [lead, team, user, t, tc] = await Promise.all([
    getLead(leadId),
    getTeam(),
    getCurrentUser(),
    getTranslations('internal.leads'),
    getTranslations('internal.common'),
  ])
  if (!lead) notFound()

  const client = lead.converted_client_id ? await getClient(lead.converted_client_id) : null
  const teamOptions = team.map((m) => ({ id: m.id, label: m.full_name ?? m.id }))
  const ownerName = lead.owner_id
    ? (team.find((m) => m.id === lead.owner_id)?.full_name ?? '—')
    : tc('unassigned')
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
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('backToLeads')}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && <LeadStatusSelect leadId={lead.id} status={lead.status} />}
          {canEdit && (
            <LeadDialog
              team={teamOptions}
              lead={lead}
              trigger={<Button variant="outline">{tc('edit')}</Button>}
            />
          )}
          {canConvert && !client && <ConvertLeadDialog lead={lead} />}
          {canDelete && (
            <ConfirmDelete
              action={deleteLeadAction}
              args={[lead.id]}
              title={t('deleteTitle', { name: lead.name })}
              description={t('deleteDesc')}
              successMessage={t('deleted')}
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
              <Field label={t('email')}>
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} className="hover:underline">
                    {lead.email}
                  </a>
                ) : null}
              </Field>
              <Field label={t('phone')}>
                {lead.phone ? (
                  <a href={`tel:${lead.phone}`} className="hover:underline">
                    {lead.phone}
                  </a>
                ) : null}
              </Field>
              <Field label={t('owner')}>{ownerName}</Field>
              <Field label={t('area')}>{lead.area}</Field>
              <Field label={t('field')}>{lead.field}</Field>
              <Field label={t('interestedIn')}>{lead.plan_interest}</Field>
              <Field label={t('source')}>{lead.source}</Field>
              <Field label={t('added')}>
                {new Date(lead.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Field>
            </div>
            <Field label={t('address')}>{lead.address}</Field>
            {lead.notes && (
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('notes')}
                </p>
                <p className="whitespace-pre-line text-sm text-muted-foreground">{lead.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">{t('customer')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {client ? (
              <>
                <p className="text-muted-foreground">{t('convertedNote')}</p>
                <Link
                  href={`/clients/${client.id}`}
                  className="inline-flex items-center gap-1.5 font-medium hover:underline"
                >
                  {client.name} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <p className="text-xs text-muted-foreground">{client.slug}.flow…</p>
              </>
            ) : (
              <p className="text-muted-foreground">{t('notConvertedNote')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
