import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ArrowUpRight, Eye, UserPlus, Globe } from 'lucide-react'
import { requirePermission } from '@/lib/auth/session'
import { getVisitors } from '@/lib/db/visitor-queries'
import { Card, CardContent } from '@/components/ds/card'
import { LeadStatusBadge } from '@/components/dashboard/indicators'
import type { LeadStatus } from '@/lib/types'

/**
 * Anonymous website visitors who accepted cookies.
 *
 * Most rows have no name and never will — a cookie carries behaviour, not
 * identity. The value is the shape of the traffic and the conversion count at
 * the top, plus the journey attached to the leads that did come in. Anyone
 * expecting a list of people to call should read the "identified" figure.
 */
export default async function VisitorsPage() {
  await requirePermission('leads.view')
  const [visitors, t] = await Promise.all([getVisitors(), getTranslations('internal.visitors')])

  const identified = visitors.filter((v) => v.lead_id).length
  const totalViews = visitors.reduce((sum, v) => sum + (v.page_views ?? 0), 0)

  const stats = [
    { icon: Globe, label: t('statVisitors'), value: visitors.length },
    { icon: Eye, label: t('statPageViews'), value: totalViews },
    { icon: UserPlus, label: t('statIdentified'), value: identified },
  ]

  const lastPage = (v: (typeof visitors)[number]) =>
    [...(v.activity ?? [])].reverse().find((a) => a?.type === 'page_view')?.path ?? '—'

  const configured = (v: (typeof visitors)[number]) =>
    [...(v.activity ?? [])].reverse().find((a) => a?.type === 'package_configured')?.serviceKey

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted">
                <s.icon className="h-4.5 w-4.5 text-muted-foreground" />
              </span>
              <div>
                <p className="text-2xl font-semibold">{s.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {visitors.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-sm text-muted-foreground">{t('empty')}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="p-3 text-start font-medium">{t('colWho')}</th>
                    <th className="p-3 text-start font-medium">{t('colLastPage')}</th>
                    <th className="p-3 text-start font-medium">{t('colViews')}</th>
                    <th className="p-3 text-start font-medium">{t('colSource')}</th>
                    <th className="p-3 text-start font-medium">{t('colLastSeen')}</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((v) => {
                    const pkg = configured(v)
                    return (
                      <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3">
                          {v.leads ? (
                            <Link
                              href={`/leads/${v.leads.id}`}
                              className="inline-flex items-center gap-1.5 font-medium hover:underline"
                            >
                              {v.leads.name}
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">
                              {t('anonymous')}
                              <span className="ms-1.5 font-mono text-xs opacity-60">
                                {v.visitor_id.slice(0, 8)}
                              </span>
                            </span>
                          )}
                          <div className="mt-1 flex items-center gap-2">
                            {v.leads && (
                              <LeadStatusBadge status={v.leads.status as LeadStatus} />
                            )}
                            {pkg && (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                {t('configured', { plan: pkg })}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{lastPage(v)}</td>
                        <td className="p-3">{v.page_views}</td>
                        <td className="max-w-[220px] truncate p-3 text-xs text-muted-foreground">
                          {v.utm_source || v.referrer || t('direct')}
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {new Date(v.last_seen).toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
