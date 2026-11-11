import { formatDateTime } from '@/lib/format'
import { formatMoney } from '@/lib/money'
import { dealMonths, dealTotal, parseDeal } from '@/lib/deals'
import Logo from '@/components/ui/Logo'
import type { Contract } from '@/lib/types'

/** The document speaks the contract's language, which may differ from the viewer's. */
const COPY = {
  en: {
    tag: 'Contract',
    summary: 'Terms at a glance',
    total: 'Total value',
    months: 'Months',
    start: 'Starts',
    platforms: 'Platforms',
    parties: 'Parties',
    flow: 'FLOW Agency',
    client: 'The client',
    accepted: 'Accepted',
    offline: 'signed offline',
    waiting: 'Waiting for the client’s signature',
    draft: 'Draft — not sent yet',
    note: 'Agreement document',
    unsigned: 'Signature',
  },
  ar: {
    tag: 'عقد',
    summary: 'الشروط باختصار',
    total: 'القيمة الإجمالية',
    months: 'الأشهر',
    start: 'يبدأ في',
    platforms: 'المنصات',
    parties: 'الطرفان',
    flow: 'وكالة FLOW',
    client: 'العميل',
    accepted: 'تم القبول',
    offline: 'توقيع ورقي',
    waiting: 'بانتظار توقيع العميل',
    draft: 'مسودة — لم تُرسل بعد',
    note: 'وثيقة اتفاق',
    unsigned: 'التوقيع',
  },
} as const

interface Clause {
  n: string
  heading: string
  text: string
}

/**
 * The stored body is plain text: blank-line separated paragraphs, where "3. Fees"
 * on the first line of a paragraph starts a numbered clause. Everything before the
 * first clause is the lead-in; everything after the last is the closing line.
 */
export function splitContract(body: string): { lead: string[]; clauses: Clause[]; closing: string[] } {
  const paras = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  // A first line that is just the document's title (no digits, one short line) is dropped: the page has its own headline.
  if (paras[0] && !paras[0].includes('\n') && paras[0].length < 60 && !/\d/.test(paras[0])) paras.shift()
  const lead: string[] = []
  const clauses: Clause[] = []
  const closing: string[] = []
  for (const p of paras) {
    const m = p.match(/^(\d+)[.\-)]\s*([^\n]+)\n?([\s\S]*)$/)
    if (m) clauses.push({ n: m[1], heading: m[2].trim(), text: m[3].trim() })
    else if (clauses.length === 0) lead.push(p)
    else closing.push(p)
  }
  return { lead, clauses, closing }
}

const label = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55'

/**
 * The contract as one printable page (Save as PDF from the browser), laid out like the
 * brand kit: warm ground, grey rounded cards, a huge tight headline, numbered clause
 * labels, one dark callout for the terms and a footer rule. Used by the team's detail
 * page and the client's portal alike.
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
  const c = COPY[contract.locale]
  const { lead, clauses, closing } = splitContract(contract.body)
  const accepted = contract.status === 'accepted'
  const when = (iso: string) => formatDateTime(iso, contract.locale)
  const terms = parseDeal(contract.terms)
  const stateLine = accepted ? c.accepted : contract.status === 'sent' ? c.waiting : c.draft

  return (
    <article
      dir={rtl ? 'rtl' : 'ltr'}
      lang={contract.locale}
      className="print-invoice print-exact mx-auto max-w-4xl rounded-[28px] bg-ground p-5 text-ink sm:p-10"
    >
      {/* Header row: logo, pill tag, small-caps meta */}
      <header className="flex flex-wrap items-center gap-3">
        <Logo variant="lockup" tone="green" className="h-7 w-auto" />
        <span className="rounded-full bg-sheet px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
          01 · {c.tag}
        </span>
        <span className={`${label} ms-auto`}>{clientName}</span>
      </header>

      <p className={`${label} mt-10`}>{c.parties} · {stateLine}</p>
      <h1 className="mt-3 font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl">{contract.title}</h1>

      {lead.length > 0 && (
        <div className="mt-6 max-w-2xl space-y-3 text-[15px] leading-relaxed text-ink/80">
          {lead.map((p, i) => (
            <p key={i} className="whitespace-pre-line">{p}</p>
          ))}
        </div>
      )}

      {/* One dark callout: what was agreed, at a glance */}
      {terms && (
        <section className="mt-8 rounded-[22px] bg-ink p-6 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">{c.summary}</p>
          <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-white/60">{c.total}</dt>
              <dd className="mt-1 font-display text-2xl font-bold">{formatMoney(dealTotal(terms), 'EGP', 0, contract.locale)}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/60">{c.months}</dt>
              <dd className="mt-1 font-display text-2xl font-bold">{dealMonths(terms)}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/60">{c.start}</dt>
              <dd className="mt-1 font-display text-2xl font-bold">{contract.start_date ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/60">{c.platforms}</dt>
              <dd className="mt-1 text-sm font-medium leading-snug">{terms.platforms.join(' · ') || '—'}</dd>
            </div>
          </dl>
        </section>
      )}

      {/* Numbered clauses as grey cards */}
      {clauses.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {clauses.map((cl) => (
            <section
              key={cl.n}
              className={`break-inside-avoid rounded-[22px] bg-sheet p-5 ${cl.text.length > 420 ? 'md:col-span-2' : ''}`}
            >
              <p className={label}>
                {cl.n} · {cl.heading}
              </p>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed">{cl.text}</p>
            </section>
          ))}
        </div>
      )}

      {closing.length > 0 && (
        <div className="mt-6 space-y-3 text-[15px] font-medium leading-relaxed">
          {closing.map((p, i) => (
            <p key={i} className="whitespace-pre-line">{p}</p>
          ))}
        </div>
      )}

      {/* Signatures, with a lime-barred callout for the state */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[22px] bg-sheet p-5">
          <p className={label}>{c.flow}</p>
          <div className="mt-10 border-t border-ink/25 pt-2 text-sm text-ink/70">{c.unsigned}</div>
        </div>
        <div className="rounded-[22px] bg-sheet p-5">
          <p className={label}>{c.client} · {clientName}</p>
          {accepted ? (
            <p className="mt-6 font-display text-xl font-bold">{contract.accepted_name}</p>
          ) : (
            <div className="mt-10" />
          )}
          <div className="border-t border-ink/25 pt-2 text-sm text-ink/70">
            {accepted && contract.accepted_at ? when(contract.accepted_at) : c.unsigned}
          </div>
        </div>
      </section>

      {accepted && (
        <div className="mt-4 rounded-xl border-s-4 border-flow-lime bg-sheet p-4 text-sm">
          <p className="font-semibold">
            {c.accepted}
            {contract.accepted_offline ? ` (${c.offline})` : ''}
          </p>
          {!portal && contract.body_sha256 && (
            <p className="mt-1 break-all font-mono text-[11px] text-ink/55" dir="ltr">
              SHA-256 {contract.body_sha256}
            </p>
          )}
        </div>
      )}

      {/* Footer rule: site, document note, page number */}
      <footer className="mt-10 flex items-center justify-between gap-4 border-t border-ink/15 pt-4 text-xs text-ink/55">
        <span className="font-semibold">flow-agency-eg.com</span>
        <span>{c.note}</span>
        <span className="font-semibold text-ink">01</span>
      </footer>
    </article>
  )
}
