import { MobileNav } from './MobileNav'
import { Brand } from './Brand'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import type { SidebarUser } from './SidebarControls'
import type { PermissionKey } from '@/lib/types'

/** Below `lg` there is no sidebar: a slim bar with the menu button (search, language, theme and account live in the drawer). */
export function MobileBar({ permissions, user }: { permissions: PermissionKey[]; user: SidebarUser }) {
  return (
    <header className="flex h-14 items-center gap-2 rounded-2xl bg-card px-2 shadow-[var(--shadow-sm)] lg:hidden">
      <MobileNav permissions={permissions} user={user} />
      <Brand />
      <NotificationBell className="ms-auto" />
    </header>
  )
}
