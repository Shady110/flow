import { requireClientContext } from '@/lib/auth/client-session'
import { getRequirements } from '@/lib/db/requirement-queries'
import { getContracts } from '@/lib/db/contract-queries'
import { PapersView } from '@/components/portal/PapersView'

export default async function PapersPage() {
  const { client } = await requireClientContext()
  const [docs, contracts] = await Promise.all([getRequirements(client.id, { kind: 'client_document' }), getContracts(client.id)])
  // RLS already hides drafts. Show what needs signing first, then the latest signed one.
  const contract = contracts.find((c) => c.status === 'sent') ?? contracts.find((c) => c.status === 'accepted') ?? null
  return <PapersView docs={docs} contract={contract} />
}
