import { cookies } from 'next/headers'
import { requireUser } from '@/lib/auth/session'
import { roleLabel } from '@/lib/access'
import { getLeadCapInfo } from '@/lib/db/lead-queries'
import { Sidebar, SIDEBAR_COOKIE } from '@/components/dashboard/Sidebar'
import { MobileBar } from '@/components/dashboard/MobileBar'

export default async function AuthedInternalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()
  const permissions = [...user.permissions]
  const initialCollapsed = (await cookies()).get(SIDEBAR_COOKIE)?.value === 'rail'
  // The cap gauge is for anyone who works leads (Sales, the CEO).
  const cap = user.permissions.has('leads.view') || user.permissions.has('ops.overview')
    ? await getLeadCapInfo(true).then((c) => ({ won: c.won, cap: c.cap }))
    : null

  const sidebarUser = {
    name: user.full_name ?? '',
    email: user.email,
    roleName: user.roles.length ? user.roles.map((r) => roleLabel(r.name)).join(' · ') : null,
    canChat: user.permissions.has('chat.access'),
  }
  const isCeo = user.permissions.has('ops.overview')

  return (
    <div className="flex min-h-screen gap-4 p-3 lg:p-4">
      <Sidebar
        permissions={permissions}
        cap={cap}
        capHref={isCeo ? '/insights/sales' : '/leads'}
        user={sidebarUser}
        initialCollapsed={initialCollapsed}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <MobileBar permissions={permissions} user={sidebarUser} />
        <main className="flex-1 px-1 pb-6 pt-2 sm:px-2 lg:px-3">{children}</main>
      </div>
    </div>
  )
}
