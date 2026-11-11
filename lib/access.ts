/**
 * Roles, departments and levels. A person can hold several roles; their
 * departments and level are derived from those roles, never stored on the person.
 */
import type { PermissionKey, RoleInfo } from '@/lib/types'

export const DEPARTMENT_ORDER = ['sales', 'content', 'accounts'] as const

/** Union of the permission sets of all the person's roles. */
export function unionPermissions(sets: PermissionKey[][]): Set<PermissionKey> {
  return new Set(sets.flat())
}

/** The departments a person belongs to through their roles, in a fixed order. */
export function departmentsOf(roles: Pick<RoleInfo, 'department_key'>[]): string[] {
  const keys = new Set(roles.map((r) => r.department_key).filter((k): k is string => !!k))
  const known = DEPARTMENT_ORDER.filter((d) => keys.has(d))
  return [...known, ...[...keys].filter((k) => !(DEPARTMENT_ORDER as readonly string[]).includes(k))]
}

/** Directors rank as "head", employees as "member"; the CEO (no department) has none. */
export function levelOf(roles: Pick<RoleInfo, 'rank'>[]): 'head' | 'member' | null {
  if (roles.some((r) => r.rank === 'director')) return 'head'
  if (roles.some((r) => r.rank === 'employee')) return 'member'
  return null
}

/** Where someone starts: the first department's home they can open, else the CEO overview, else the first page. */
export function startPath(opts: {
  permissions: ReadonlySet<PermissionKey>
  departments: string[]
  departmentHomes: Record<string, string>
  canOpen: (href: string) => boolean
  firstOpenable: () => string | undefined
}): string {
  for (const d of opts.departments) {
    const home = opts.departmentHomes[d]
    if (home && home !== '/' && opts.canOpen(home)) return home
  }
  if (opts.permissions.has('ops.overview')) return '/'
  return opts.firstOpenable() ?? '/'
}

/** "ceo" -> "CEO", "sales-director" -> "Sales director". */
export function roleLabel(name: string): string {
  if (name === 'ceo') return 'CEO'
  const spaced = name.replace(/-/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** The permission a work page needs; longest prefix wins. Pages not listed are open to any staff member. */
const PAGE_PERMISSION: [string, PermissionKey][] = [
  ['/accounts/tickets', 'tickets.manage'],
  ['/accounts', 'accounts.workspace'],
  ['/content', 'content.workspace'],
  ['/tasks', 'tasks.create'],
  ['/pipeline', 'pipeline.manage'],
  ['/leads', 'sales.workspace'],
]

/** Whether a viewer can open a link, so an overview never shows the CEO a link that just bounces. */
export function canOpenHref(permissions: ReadonlySet<PermissionKey>, href: string): boolean {
  const hit = PAGE_PERMISSION.find(([prefix]) => href === prefix || href.startsWith(`${prefix}/`))
  return !hit || permissions.has(hit[1])
}
