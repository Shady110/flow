import { INTERNAL_NAV, canSee } from '@/components/dashboard/nav'
import type { PermissionKey } from '@/lib/types'

/**
 * Where a signed-in staff member starts. Their department's workspace comes first
 * (Sales -> leads, Content -> content queue, ...) as long as their role can open
 * it; otherwise the first section their role can open; the CEO overview is for
 * whoever holds `ops.overview` and has no department workspace.
 */
export function homePathFor(permissions: ReadonlySet<PermissionKey>, departmentHome?: string | null): string {
  if (departmentHome && departmentHome !== '/') {
    const item = INTERNAL_NAV.find((i) => i.href === departmentHome)
    if (item && canSee(item, permissions)) return departmentHome
  }
  if (permissions.has('ops.overview')) return '/'
  const first = INTERNAL_NAV.find(
    // Section items only: the shared Inbox shouldn't be anyone's "home".
    (i) => !!i.section && !i.soon && canSee(i, permissions),
  )
  return first?.href ?? '/'
}
