import { formatMoney } from '@/lib/money'
import type { InvoiceWithMeta } from '@/lib/db/finance-queries'

/**
 * Branded, print-friendly invoice document. Purely presentational so it can be
 * rendered in the internal dashboard and the client portal alike.
 */
export function InvoiceDocument({ invoice }: { invoice: InvoiceWithMeta }) {
  const { currency } = invoice
  return (
    <div className="print-invoice mx-auto max-w-3xl rounded-2xl border border-flow-border bg-white p-8 text-flow-text shadow-sm sm:p-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 border-b border-flow-border pb-6 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold tracking-tight text-flow-green">FLOW</span>
            <span className="rounded-full bg-flow-lime px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-flow-green">
              Agency
            </span>
          </div>
          <p className="mt-2 text-xs text-flow-text-muted">
            FLOW Agency · E-commerce content & marketplace management
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-bold uppercase tracking-wide text-flow-green">Invoice</p>
          <p className="mt-1 text-sm font-medium">{invoice.number}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-6 py-6 sm:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-flow-text-muted">Billed to</p>
          <p className="mt-1 text-sm font-medium">{invoice.client_name}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-flow-text-muted">Issued</p>
          <p className="mt-1 text-sm">{new Date(invoice.issue_date).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-flow-text-muted">Due</p>
          <p className="mt-1 text-sm">
            {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-flow-text-muted">Status</p>
          <p className="mt-1 text-sm capitalize">{invoice.status}</p>
        </div>
      </div>

      {/* Line items */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y border-flow-border text-left text-[11px] uppercase tracking-wider text-flow-text-muted">
            <th className="py-2 font-semibold">Description</th>
            <th className="py-2 text-right font-semibold">Qty</th>
            <th className="py-2 text-right font-semibold">Unit</th>
            <th className="py-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it) => (
            <tr key={it.id} className="border-b border-flow-border/60">
              <td className="py-2.5 pr-4">{it.description}</td>
              <td className="py-2.5 text-right tabular-nums">{Number(it.quantity)}</td>
              <td className="py-2.5 text-right tabular-nums">{formatMoney(Number(it.unit_price), currency)}</td>
              <td className="py-2.5 text-right tabular-nums">
                {formatMoney(Number(it.quantity) * Number(it.unit_price), currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="ml-auto mt-6 w-full max-w-xs space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-flow-text-muted">Subtotal</span>
          <span className="tabular-nums">{formatMoney(invoice.total, currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-flow-text-muted">Paid</span>
          <span className="tabular-nums">{formatMoney(invoice.paid, currency)}</span>
        </div>
        <div className="flex justify-between border-t border-flow-border pt-2 font-display text-base font-bold text-flow-green">
          <span>Balance due</span>
          <span className="tabular-nums">{formatMoney(invoice.balance, currency)}</span>
        </div>
      </div>

      {invoice.notes && (
        <div className="mt-8 border-t border-flow-border pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-flow-text-muted">Notes</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-flow-text-muted">{invoice.notes}</p>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-flow-text-muted">Thank you for working with FLOW.</p>
    </div>
  )
}
