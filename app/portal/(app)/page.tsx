import { getTranslations } from 'next-intl/server'
import { ClipboardCheck, FileSignature, LifeBuoy, MessageCircle, Package, Wallet } from 'lucide-react'
import { requireClientContext } from '@/lib/auth/client-session'
import { createClient } from '@/lib/supabase/server'
import { getPlatforms } from '@/lib/db/flow-queries'
import { getContracts } from '@/lib/db/contract-queries'
import { getRequirements } from '@/lib/db/requirement-queries'
import { getInvoices } from '@/lib/db/finance-queries'
import { getTickets } from '@/lib/db/ticket-queries'
import { getPortalSettings } from '@/lib/db/portal-settings'
import { CLIENT_STAGES } from '@/lib/constants'
import { journeyPercent, nextStep } from '@/lib/portal-next-step'
import { whatsappUrl } from '@/lib/contact'
import { formatMoney } from '@/lib/money'
import type { StageEvent } from '@/lib/types'
import { NextStepCard } from '@/components/portal/NextStepCard'
import { SectionCard } from '@/components/portal/SectionCard'
import { JourneyCard } from '@/components/portal/JourneyCard'
import { LatestUpdates } from '@/components/portal/LatestUpdates'
import { TalkToUs } from '@/components/portal/TalkToUs'

export default async function PortalHome() {
  const { client, clientUser } = await requireClientContext()
  const supabase = await createClient()
  const [t, to, tm] = await Promise.all([
    getTranslations('portal.home'),
    getTranslations('portal.overview'),
    getTranslations('internal.marketplace'),
  ])

  const [platforms, contracts, papers, invoices, tickets, settings, eventsRes, productsRes] = await Promise.all([
    getPlatforms(client.id),
    getContracts(client.id),
    getRequirements(client.id, { kind: 'client_document' }),
    getInvoices(client.id),
    getTickets({ clientId: client.id }),
    getPortalSettings(),
    supabase.from('stage_events').select('*').eq('client_id', client.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('client_id', client.id),
  ])

  const due = invoices.filter((i) => i.status === 'sent' && i.balance > 0)
  const amountDue = due.reduce((s, i) => s + i.balance, 0)
  const contractWaiting = contracts.some((c) => c.status === 'sent')
  const contractSigned = contracts.some((c) => c.status === 'accepted')
  const waiting = tickets.filter((x) => x.status === 'waiting_client').length
  const requiredPapers = papers.filter((p) => p.required && p.status !== 'waived')
  const sentPapers = requiredPapers.filter((p) => p.status === 'submitted' || p.status === 'approved').length
  const toSend = requiredPapers.length - sentPapers
  const live = platforms.some((p) => p.stage === 'managing')
  const productCount = productsRes.count ?? 0

  const step = nextStep({ contractWaiting, papers, invoicesDue: due.length, requestsWaiting: waiting })
  const percent = journeyPercent({ clientStage: client.stage, platforms })

  const stage = (s: string) => ({ id: s, label: to(`stage.${s}`), help: to(`stageHelp.${s}`) })
  const tracks =
    client.stage !== 'onboarded'
      ? [{ title: null, steps: CLIENT_STAGES.map(stage), current: client.stage }]
      : platforms.map((p) => ({ title: tm(p.platform), steps: p.stages.map(stage), current: p.stage }))

  // What the team is doing right now, for the all-set card.
  const focus = client.stage !== 'onboarded' ? client.stage : (platforms.find((p) => p.stage !== 'managing') ?? platforms[0])?.stage
  const allSetHelp = focus ? to(`stageHelp.${focus}`) : t('allSetFallback')

  const platformNames = Object.fromEntries(platforms.map((p) => [p.id, tm(p.platform)]))
  const wa = whatsappUrl(settings.whatsapp)

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{t('hello', { name: clientUser.full_name.split(' ')[0] })}</h1>
        <p className="mt-1 text-base text-muted-foreground">{t('intro')}</p>
      </div>

      <NextStepCard step={step} allSetHelp={allSetHelp} />

      <section aria-label={t('sectionsLabel')} className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <SectionCard
          href="/contract"
          icon={FileSignature}
          title={t('sectionContract')}
          hint={contractWaiting ? t('contractSign') : contractSigned ? t('contractDone') : t('contractNone')}
          badge={contractWaiting ? { text: t('badgeSign'), tone: 'todo' } : contractSigned ? { text: t('badgeSigned'), tone: 'good' } : undefined}
        />
        <SectionCard
          href="/papers"
          icon={ClipboardCheck}
          title={t('sectionPapers')}
          hint={requiredPapers.length ? t('papersHint', { done: sentPapers, total: requiredPapers.length }) : t('papersNone')}
          badge={toSend > 0 ? { text: t('badgeSend', { count: toSend }), tone: 'todo' } : undefined}
        />
        <SectionCard
          href="/tickets"
          icon={LifeBuoy}
          title={t('sectionRequests')}
          hint={live ? t('requestsHint') : t('requestsLocked')}
          badge={waiting > 0 ? { text: t('badgeReply'), tone: 'todo' } : undefined}
        />
        <SectionCard
          href="/invoices"
          icon={Wallet}
          title={t('sectionPayments')}
          hint={due.length ? t('paymentsDue', { amount: formatMoney(amountDue, 'EGP', 0) }) : invoices.length ? t('paymentsPaid') : t('paymentsNone')}
          badge={due.length ? { text: t('badgeDue', { count: due.length }), tone: 'todo' } : undefined}
        />
        <SectionCard href="/chat" icon={MessageCircle} title={t('sectionMessages')} hint={t('messagesHint')} />
        <SectionCard href="/products" icon={Package} title={t('sectionProducts')} hint={t('productsHint', { count: productCount })} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <JourneyCard percent={percent} tracks={tracks} />
        <LatestUpdates events={(eventsRes.data as StageEvent[]) ?? []} platformNames={platformNames} />
      </div>

      <TalkToUs whatsapp={wa} />
    </div>
  )
}
