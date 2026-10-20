/** Departments and levels: which team members a viewer sees, and where a person starts. */

export type Level = 'member' | 'lead' | 'head'
export const LEVELS: Level[] = ['member', 'lead', 'head']

export interface OrgPerson {
  id: string
  department_key: string | null
  level: Level | null
}

/**
 * Who a viewer sees on the Team page: the CEO view (`seesAll`) sees everyone;
 * a Lead or Head sees their own department; a Member sees only themselves.
 */
export function visibleTeam<T extends OrgPerson>(viewer: OrgPerson & { seesAll: boolean }, team: T[]): T[] {
  if (viewer.seesAll) return team
  if ((viewer.level === 'lead' || viewer.level === 'head') && viewer.department_key) {
    return team.filter((p) => p.department_key === viewer.department_key || p.id === viewer.id)
  }
  return team.filter((p) => p.id === viewer.id)
}

/** Order for lists: heads first, then leads, then members. */
export const levelRank = (l: Level | null) => (l === 'head' ? 0 : l === 'lead' ? 1 : l === 'member' ? 2 : 3)
