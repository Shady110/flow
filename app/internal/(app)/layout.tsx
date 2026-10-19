import { requireUser } from '@/lib/auth/session'
import { getLeadCapInfo } from '@/lib/db/lead-queries'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'

export default async function AuthedInternalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()
  const permissions = [...user.permissions]
  // The cap gauge is for anyone who works leads (Sales, the CEO).
  const cap = user.permissions.has('leads.view')
    ? await getLeadCapInfo(true).then((c) => ({ won: c.won, cap: c.cap }))
    : null

  return (
    <div className="flex min-h-screen gap-4 p-3 lg:p-4">
      <Sidebar permissions={permissions} cap={cap} />
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <Topbar
          name={user.full_name ?? ''}
          email={user.email}
          roleName={user.role?.name ?? null}
          canChat={user.permissions.has('chat.access')}
          permissions={permissions}
        />
        <main className="flex-1 px-1 pb-6 pt-2 sm:px-2 lg:px-3">{children}</main>
      </div>
    </div>
  )
}
