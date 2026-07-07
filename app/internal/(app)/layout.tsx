import { requireUser } from '@/lib/auth/session'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'

export default async function AuthedInternalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()

  return (
    <div className="flex min-h-screen">
      <Sidebar permissions={[...user.permissions]} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          name={user.full_name ?? ''}
          email={user.email}
          roleName={user.role?.name ?? null}
          canChat={user.permissions.has('chat.access')}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
