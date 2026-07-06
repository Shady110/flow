import { headers } from 'next/headers'

// Placeholder client-portal home. The full experience (products, invoices,
// chat) is built in Phase 3 once client_users auth is wired up.
export default async function PortalHome() {
  const slug = (await headers()).get('x-tenant-slug') ?? 'your'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <span className="font-display text-3xl font-bold tracking-tight text-flow-green">FLOW</span>
      <h1 className="font-display text-xl font-bold capitalize">{slug} portal</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Your dashboard — products, statuses, invoices and chat with the FLOW team —
        is coming soon.
      </p>
    </div>
  )
}
