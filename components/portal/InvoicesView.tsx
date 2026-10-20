import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { CheckCircle2, ChevronRight, Wallet } from 'lucide-react'
import { formatMoney } from '@/lib/money'
import { formatDate } from '@/lib/format'
import { invoiceState, type InvoiceState } from '@/lib/invoice-state'
import { whatsappUrl } from '@/lib/contact'
import type { InvoiceWithMeta } from '@/lib/db/finance-queries'
import { HowToPay } from '@/components/portal/HowToPay'
import { PayOnlineButton } from '@/components/portal/PayOnlineButton'
import { PayResultBanner } from '@/components/portal/PayResultBanner'
import { AutoPayCard } from '@/components/portal/AutoPayCard'
import type { ClientBillingPublic } from '@/lib/types'
import { Button } from '@/components/ds/button'
import { cn } from '@/lib/utils'

const CHIP: Record<InvoiceState, string> = {
  paid: 'bg-flow-lime/60 text-flow-green',
  due: 'bg-amber-100 text-amber-900',
  overdue: 'bg-destructive/10 text-destructive',
}

/** The client's Payments screen: what is owed up top, then one card per invoice (no table). */
export async function InvoicesView({
  invoices,
  whatsapp,
  paymentInstructions,
  online = false,
  offerAuto = false,
  billing = null,
  payResult,
}: {
  invoices: InvoiceWithMeta[]
  whatsapp: string | null
  paymentInstructions: { en: string; ar: string }
  /** Online payment is switched on. */
  online?: boolean
  /** Automatic monthly payments are switched on (and this client has a contract to base them on). */
  offerAuto?: boolean
  billing?: ClientBillingPublic | null
  payResult?: 'ok' | 'failed' | 'pending'
}) {
  const [t, locale] = await Promise.all([getTranslations('portal.payments'), getLocale()])
  const instructions = locale === 'ar' ? paymentInstructions.ar || paymentInstructions.en : paymentInstructions.en || paymentInstructions.ar
  const currency = invoices[0]?.currency ?? 'EGP'
  const money = (n: number, c = currency) => formatMoney(n, c, 0, locale)

  const rows = invoices.map((i) => ({ i, state: invoiceState(i) }))
  const owing = rows.filter((r) => r.state !== 'paid')
  const paid = rows.filter((r) => r.state === 'paid')
  const owed = owing.reduce((s, r) => s + r.i.balance, 0)

  const card = ({ i, state }: (typeof rows)[number]) => (
    <li key={i.id} className="space-y-4 rounded-3xl border border-border/60 bg-card p-4 shadow-[var(--shadow-xs)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg font-bold" dir="ltr">{i.number}</p>
          <p className="text-sm text-muted-foreground">
            {i.due_date ? t('dueOn', { date: formatDate(i.due_date, locale) }) : t('issuedOn', { date: formatDate(i.issue_date, locale) })}
          </p>
        </div>
        <span className={cn('rounded-full px-3 py-1 text-sm font-semibold', CHIP[state])}>{t(`state.${state}`)}</span>
      </div>
      <p className="font-display text-3xl font-bold tracking-tight">{money(state === 'paid' ? i.total : i.balance, i.currency)}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {state !== 'paid' && online && (
          <PayOnlineButton invoiceId={i.id} amountText={money(i.balance, i.currency)} offerAuto={offerAuto && billing?.status !== 'active'} className="h-14 w-full text-base sm:w-auto sm:px-8" />
        )}
        {state !== 'paid' && (
          <HowToPay
            amountText={money(i.balance, i.currency)}
            reference={i.number}
            instructions={instructions}
            receiptHref={whatsappUrl(whatsapp, t('receiptText', { number: i.number }))}
            label={online ? t('payOr') : t('howToPay')}
            variant={online ? 'outline' : 'default'}
            className="h-12 w-full text-base sm:w-auto sm:px-8"
          />
        )}
        <Button asChild size="lg" variant="outline" className="h-12 w-full text-base sm:w-auto sm:px-8">
          <Link href={`/invoices/${i.id}`}>
            {state === 'paid' ? t('viewReceipt') : t('viewInvoice')} <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </Link>
        </Button>
      </div>
    </li>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-base text-muted-foreground">{t('intro')}</p>
      </div>

      {payResult && <PayResultBanner result={payResult} />}
      {online && billing && billing.status !== 'none' && <AutoPayCard billing={billing} />}

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <Wallet className="h-10 w-10 text-muted-foreground" />
          <p className="text-base text-muted-foreground">{t('empty')}</p>
        </div>
      ) : (
        <>
          {owed > 0 ? (
            <div className="rounded-3xl p-6 text-white shadow-[var(--shadow-md)]" style={{ background: 'var(--gradient-dark-panel)' }}>
              <p className="text-base text-white/80">{t('youOwe')}</p>
              <p className="mt-1 font-display text-5xl font-bold tracking-tight">{money(owed)}</p>
              <p className="mt-1 text-sm text-white/70">{t('acrossInvoices', { count: owing.length })}</p>
              <HowToPay
                amountText={money(owed)}
                instructions={instructions}
                receiptHref={whatsappUrl(whatsapp, t('receiptTextGeneral'))}
                label={t('howToPay')}
                className="mt-5 h-14 w-full bg-white text-base text-flow-green hover:bg-white/90 sm:w-auto sm:px-10"
              />
            </div>
          ) : (
            <div className="flex items-center gap-4 rounded-3xl bg-flow-lime/30 p-5">
              <CheckCircle2 className="h-9 w-9 shrink-0 text-flow-green" />
              <div>
                <p className="font-display text-xl font-bold">{t('allPaidTitle')}</p>
                <p className="text-base text-muted-foreground">{t('allPaidHelp')}</p>
              </div>
            </div>
          )}

          {owing.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold tracking-tight">{t('toPay')}</h2>
              <ul className="space-y-3">{owing.map(card)}</ul>
            </section>
          )}
          {paid.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold tracking-tight">{t('paidSection')}</h2>
              <ul className="space-y-3">{paid.map(card)}</ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
