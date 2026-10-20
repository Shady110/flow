import { getLocale, getTranslations } from 'next-intl/server'
import { formatMoney } from '@/lib/money'
import { formatDate } from '@/lib/format'
import type { InvoiceWithMeta } from '@/lib/db/finance-queries'

/**
 * Branded, print-friendly invoice document, in the viewer's language. Purely
 * presentational so it renders in the team dashboard and the client portal alike.
 * Layout uses logical properties so Arabic mirrors correctly, and the line items
 * stack on a phone instead of forcing a four-column table.
 *
 * `portal` hides the Issued date and Status (client-facing view). On the team
 * view those two show on screen but are `no-print`, so they never reach a PDF.
 */
export async function InvoiceDocument({
  invoice,
  portal = false,
}: {
  invoice: InvoiceWithMeta
  portal?: boolean
}) {
  const [t, ts, locale] = await Promise.all([
    getTranslations('invoiceDoc'),
    getTranslations('internal.invoiceStatus'),
    getLocale(),
  ])
  const { currency } = invoice
  const money = (n: number) => formatMoney(n, currency, 2, locale)
  const label = 'text-[11px] font-semibold uppercase tracking-wider text-flow-text-muted'

  return (
    <div className="print-invoice mx-auto max-w-3xl rounded-2xl border border-flow-border bg-white p-5 text-flow-text shadow-sm sm:p-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 border-b border-flow-border pb-6 sm:flex-row sm:items-start">
        <div>
          <div className="print-exact inline-flex items-center rounded-xl bg-flow-green px-4 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/flow-wordmark-white.png" alt="FLOW Agency" className="h-7 w-auto object-contain" />
          </div>
          <p className="mt-3 text-xs text-flow-text-muted">{t('tagline')}</p>
        </div>
        <div className="sm:text-end">
          <p className="font-display text-xl font-bold uppercase tracking-wide text-flow-green">{t('invoice')}</p>
          <p className="mt-1 text-sm font-medium"><bdi dir="ltr">{invoice.number}</bdi></p>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-6 py-6 sm:grid-cols-4">
        <div>
          <p className={label}>{t('billedTo')}</p>
          <p className="mt-1 text-sm font-medium">{invoice.client_name}</p>
        </div>
        {!portal && (
          <div className="no-print">
            <p className={label}>{t('issued')}</p>
            <p className="mt-1 text-sm">{formatDate(invoice.issue_date, locale)}</p>
          </div>
        )}
        <div>
          <p className={label}>{t('due')}</p>
          <p className="mt-1 text-sm">{invoice.due_date ? formatDate(invoice.due_date, locale) : '—'}</p>
        </div>
        {!portal && (
          <div className="no-print">
            <p className={label}>{t('status')}</p>
            <p className="mt-1 text-sm">{ts(invoice.status)}</p>
          </div>
        )}
      </div>

      {/* Line items: a table from `sm` up (and in print), stacked rows on a phone. */}
      <table className="hidden w-full text-sm sm:table print:table">
        <thead>
          <tr className={`border-y border-flow-border text-start ${label}`}>
            <th className="py-2 text-start font-semibold">{t('description')}</th>
            <th className="py-2 text-end font-semibold">{t('qty')}</th>
            <th className="py-2 text-end font-semibold">{t('unit')}</th>
            <th className="py-2 text-end font-semibold">{t('amount')}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it) => (
            <tr key={it.id} className="border-b border-flow-border/60">
              <td className="py-2.5 pe-4">{it.description}</td>
              <td className="py-2.5 text-end tabular-nums">{Number(it.quantity)}</td>
              <td className="py-2.5 text-end tabular-nums">{money(Number(it.unit_price))}</td>
              <td className="py-2.5 text-end tabular-nums">{money(Number(it.quantity) * Number(it.unit_price))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="divide-y divide-flow-border/60 border-y border-flow-border sm:hidden print:hidden">
        {invoice.items.map((it) => (
          <li key={it.id} className="flex items-start justify-between gap-4 py-3 text-sm">
            <div className="min-w-0">
              <p className="font-medium">{it.description}</p>
              <p className="mt-0.5 text-xs text-flow-text-muted">
                {Number(it.quantity)} × {money(Number(it.unit_price))}
              </p>
            </div>
            <p className="shrink-0 font-medium tabular-nums">{money(Number(it.quantity) * Number(it.unit_price))}</p>
          </li>
        ))}
      </ul>

      {/* Totals */}
      <div className="ms-auto mt-6 w-full max-w-xs space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-flow-text-muted">{t('subtotal')}</span>
          <span className="tabular-nums">{money(invoice.total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-flow-text-muted">{t('paid')}</span>
          <span className="tabular-nums">{money(invoice.paid)}</span>
        </div>
        <div className="flex justify-between border-t border-flow-border pt-2 font-display text-base font-bold text-flow-green">
          <span>{t('balanceDue')}</span>
          <span className="tabular-nums">{money(invoice.balance)}</span>
        </div>
      </div>

      {invoice.notes && (
        <div className="mt-8 border-t border-flow-border pt-4">
          <p className={label}>{t('notes')}</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-flow-text-muted">{invoice.notes}</p>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-flow-text-muted">{t('thanks')}</p>
    </div>
  )
}
