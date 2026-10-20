import { formatDateTime } from '@/lib/format'
import type { Contract } from '@/lib/types'

/**
 * The contract as one printable page (Save as PDF from the browser). Used by the
 * CEO's detail page and the client's portal alike; the body is plain text where
 * a blank line starts a new paragraph.
 */
export function ContractDocument({
  contract,
  clientName,
  portal = false,
}: {
  contract: Contract
  clientName: string
  /** Client view: no technical receipt (the hash stays internal). */
  portal?: boolean
}) {
  const rtl = contract.locale === 'ar'
  const paragraphs = contract.body.split(/\n{2,}/)
  const accepted = contract.status === 'accepted'
  const when = (iso: string) => formatDateTime(iso, contract.locale)

  return (
    <article
      dir={rtl ? 'rtl' : 'ltr'}
      lang={contract.locale}
      className="print-invoice mx-auto max-w-3xl rounded-2xl border border-flow-border bg-white p-5 text-flow-text shadow-sm sm:p-10"
    >
      <header className="flex items-start justify-between gap-6 border-b border-flow-border pb-6">
        <div className="print-exact inline-flex items-center rounded-xl bg-flow-green px-4 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/flow-wordmark-white.png" alt="FLOW Agency" className="h-7 w-auto object-contain" />
        </div>
        <div className="text-end">
          <p className="font-display text-lg font-bold text-flow-green">{contract.title}</p>
          <p className="mt-1 text-sm text-flow-text-muted">{clientName}</p>
        </div>
      </header>

      <div className="mt-6 space-y-4 text-[15px] leading-relaxed">
        {paragraphs.map((para, i) => (
          <p key={i} className="whitespace-pre-line">
            {para}
          </p>
        ))}
      </div>

      {accepted && (
        <footer className="mt-8 rounded-xl border border-flow-border bg-flow-lime/20 p-4 text-sm">
          <p className="font-semibold text-flow-green">
            {rtl ? 'تم القبول' : 'Accepted'}
            {contract.accepted_offline ? (rtl ? ' (توقيع ورقي)' : ' (signed offline)') : ''}
          </p>
          <p className="mt-1">
            {contract.accepted_name}
            {contract.accepted_at ? ` · ${when(contract.accepted_at)}` : ''}
          </p>
          {!portal && contract.body_sha256 && (
            <p className="mt-1 break-all font-mono text-[11px] text-flow-text-muted" dir="ltr">
              SHA-256 {contract.body_sha256}
            </p>
          )}
        </footer>
      )}
    </article>
  )
}
