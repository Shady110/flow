// What the client should do next, and how far along they are. Pure (no framework
// imports) so the rules are unit-tested with plain node.

export type NextStepKind =
  | 'sign_contract'
  | 'fix_papers'
  | 'upload_papers'
  | 'pay_invoice'
  | 'reply_request'
  | 'all_set'

export interface NextStep {
  kind: NextStepKind
  href: string
  /** How many items (papers, invoices, requests) the sentence is about. */
  count: number
}

/**
 * One thing at a time, in the order a new client meets them: sign, then papers
 * (rejected ones first — they are blocking), then pay, then answer us.
 */
export function nextStep(input: {
  contractWaiting: boolean
  papers: { required: boolean; status: string }[]
  invoicesDue: number
  requestsWaiting: number
}): NextStep {
  if (input.contractWaiting) return { kind: 'sign_contract', href: '/contract', count: 1 }

  const open = input.papers.filter((p) => p.required && (p.status === 'pending' || p.status === 'rejected'))
  const rejected = open.filter((p) => p.status === 'rejected').length
  if (rejected > 0) return { kind: 'fix_papers', href: '/papers', count: rejected }
  if (open.length > 0) return { kind: 'upload_papers', href: '/papers', count: open.length }

  if (input.invoicesDue > 0) return { kind: 'pay_invoice', href: '/invoices', count: input.invoicesDue }
  if (input.requestsWaiting > 0) return { kind: 'reply_request', href: '/tickets', count: input.requestsWaiting }
  return { kind: 'all_set', href: '/', count: 0 }
}

const CLIENT_STAGES = ['group_created', 'paperwork', 'onboarded']

/**
 * Overall progress, 0–100: the onboarding track plus one track per marketplace.
 * A track's last step counts as done once reached; earlier steps count when passed.
 * Marketplaces haven't started until the client is onboarded.
 */
export function journeyPercent(input: {
  clientStage: string
  platforms: { stage: string; stages: string[] }[]
}): number {
  const done = (stages: string[], current: string) => {
    const i = stages.indexOf(current)
    if (i < 0) return 0
    return i === stages.length - 1 ? stages.length : i
  }
  let total = CLIENT_STAGES.length
  let completed = done(CLIENT_STAGES, input.clientStage)
  const onboarded = input.clientStage === 'onboarded'
  for (const p of input.platforms) {
    total += p.stages.length
    if (onboarded) completed += done(p.stages, p.stage)
  }
  return total === 0 ? 0 : Math.round((completed / total) * 100)
}
