import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { requirePermission, getCurrentUser } from '@/lib/auth/session'
import { getLead, getLeadActivities, getLeadCapInfo } from '@/lib/db/lead-queries'
import { LeadDealCard } from '@/components/leads/LeadDealCard'
import { LeadActivityList } from '@/components/leads/LeadActivityList'
import { LeadCapBanner } from '@/components/leads/LeadCapBanner'
import { LogContactDialog } from '@/components/leads/LogContactDialog'
import { getLeadJourney } from '@/lib/db/visitor-queries'
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
  const [lead, team, user, t, tc, activities] = await Promise.all([
    getLead(leadId),
    getTeam(),
    getCurrentUser(),
    getTranslations('internal.leads'),
    getTranslations('internal.common'),
    getLeadActivities(leadId),
  ])
  if (!lead) notFound()
  const cap = await getLeadCapInfo(!!user?.permissions.has('pipeline.manage'))
  const convertBlocked = cap.blocked && lead.status !== 'won'

  // Anonymous browsing session, if this lead came from the website.
  const journey = await getLeadJourney(leadId)

  const client = lead.converted_client_id ? await getClient(lead.converted_client_id) : null
  const teamOptions = team.map((m) => ({ id: m.id, label: m.full_name ?? m.id }))
  const ownerName = lead.owner_id
    ? (team.find((m) => m.id === lead.owner_id)?.full_name ?? '—')
    : tc('unassigned')
  const canEdit = !!user?.permissions.has('leads.edit')
  const canDelete = !!user?.permissions.has('leads.delete')
  const canConvert = !!user?.permissions.has('leads.convert')
  const names = Object.fromEntries(team.map((m) => [m.id, m.full_name ?? '—']))

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
          {canEdit && <LogContactDialog leadId={lead.id} status={lead.status} />}
          {canEdit && <LeadStatusSelect leadId={lead.id} status={lead.status} capBlocked={cap.blocked} />}
          {canEdit && (
            <LeadDialog
              team={teamOptions}
              lead={lead}
              trigger={<Button variant="outline">{tc('edit')}</Button>}
            />
          )}
          {canConvert && !lead.converted_client_id && !convertBlocked && <ConvertLeadDialog lead={lead} />}
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

      <LeadCapBanner info={cap} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
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

        <LeadDealCard leadId={lead.id} deal={lead.deal} canEdit={canEdit} />
        <LeadActivityList activities={activities} names={names} />
        </div>

        {/* What they did on the site before getting in touch. Only present when
            they accepted cookies — see supabase/migrations/0011_site_visitors.sql. */}
        {journey && (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">{t('journeyTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('journeyPageViews')}>{journey.page_views}</Field>
                <Field label={t('journeyFirstSeen')}>
                  {new Date(journey.first_seen).toLocaleDateString()}
                </Field>
                <Field label={t('journeyReferrer')}>{journey.referrer}</Field>
                <Field label={t('journeySource')}>{journey.utm_source}</Field>
              </div>
              {journey.activity.length > 0 && (
                <ul className="space-y-1.5 border-t pt-3 text-xs text-muted-foreground">
                  {journey.activity.slice(-8).reverse().map((a, i) => (
                    <li key={i} className="flex justify-between gap-3">
                      <span className="truncate">
                        {a.type === 'package_configured'
                          ? `${t('journeyConfigured')}: ${a.serviceKey}`
                          : a.type === 'chat_opened'
                            ? t('journeyChat')
                            : a.path || a.type}
                      </span>
                      <span className="shrink-0">
                        {a.t ? new Date(a.t).toLocaleDateString() : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

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
              </>
            ) : lead.converted_client_id ? (
              // Sales can't open client rows (RLS), but must still see that it converted.
              <p className="text-muted-foreground">{t('convertedNote')}</p>
            ) : (
              <p className="text-muted-foreground">{t('notConvertedNote')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
