import { INTERNAL_NAV, canSee } from '@/components/dashboard/nav'
import type { PermissionKey } from '@/lib/types'

/**
 * Where a signed-in staff member lands. The CEO overview is for `ops.overview`;
 * everyone else goes to the first section their role can open (leads for Sales,
 * the content queue for Content, ...), so each person's "home" is their own work.
 */
export function homePathFor(permissions: ReadonlySet<PermissionKey>): string {
  if (permissions.has('ops.overview')) return '/'
  const first = INTERNAL_NAV.find(
    // Section items only: the shared Inbox shouldn't be anyone's "home".
    (i) => !!i.section && !i.soon && canSee(i, permissions),
  )
  return first?.href ?? '/'
}
