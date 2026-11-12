import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { requirePermission } from '@/lib/auth/session'
import { getClient } from '@/lib/db/queries'
import { getPlatforms } from '@/lib/db/flow-queries'
import { getRequirements } from '@/lib/db/requirement-queries'
import { PLATFORM_STAGES } from '@/lib/constants'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { DeliverablesPanel } from '@/components/flow/DeliverablesPanel'
import { PushToPlatformButton } from '@/components/flow/PushToPlatformButton'
import { Button } from '@/components/ds/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'

export default async function ContentAccountPage({
  params,
}: {
  params: Promise<{ platformId: string }>
}) {
  await requirePermission('content.workspace')
  const { platformId } = await params
  const platform = (await getPlatforms()).find((p) => p.id === platformId)
  if (!platform || platform.stage !== 'listing') notFound()

  const [client, items, t, tm] = await Promise.all([
    getClient(platform.client_id),
    getRequirements(platform.client_id, { kind: 'content_deliverable', platformId }),
    getTranslations('internal.content'),
    getTranslations('internal.marketplace'),
  ])
  if (!client) notFound()

  const missing = items.filter(
    (r) => r.required && !['submitted', 'approved', 'waived'].includes(r.status),
  ).length
  // The account's own next stage (the CEO may have skipped some).
  const at = PLATFORM_STAGES.indexOf(platform.stage)
  const next = platform.stages.find((s) => PLATFORM_STAGES.indexOf(s) > at)

  return (
    <div className="space-y-6">
      <Link href="/content" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('backToQueue')}
      </Link>
      <PageHeader
        title={`${client.name} · ${tm(platform.platform)}`}
        description={t('accountDescription')}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/clients/${client.id}`}>{t('clientAndProducts')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/automations"><ExternalLink className="h-4 w-4" /> {t('automations')}</Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('deliverables')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('noDeliverablesDefined')}</p>
          ) : (
            <DeliverablesPanel items={items} />
          )}
        </CardContent>
      </Card>

      {next && <PushToPlatformButton platformId={platform.id} next={next} missing={missing} />}
    </div>
  )
}
