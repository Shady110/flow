import { getTranslations } from 'next-intl/server'
import { requireClientContext } from '@/lib/auth/client-session'
import { getPlatforms } from '@/lib/db/flow-queries'
import { getTickets } from '@/lib/db/ticket-queries'
import { RequestsView } from '@/components/portal/RequestsView'

export default async function PortalTicketsPage() {
  const { client } = await requireClientContext()
  const [platforms, tickets, tm] = await Promise.all([
    getPlatforms(client.id),
    getTickets({ clientId: client.id }),
    getTranslations('internal.marketplace'),
  ])
  const options = platforms.map((p) => ({ id: p.id, platform: p.platform, label: tm(p.platform) }))
  const liveOptions = platforms.filter((p) => p.stage === 'managing').map((p) => ({ id: p.id, platform: p.platform, label: tm(p.platform) }))
  const live = liveOptions.length > 0
  return (
    <RequestsView
      tickets={tickets}
      platforms={options}
      newRequestPlatforms={liveOptions}
      live={live}
    />
  )
}
