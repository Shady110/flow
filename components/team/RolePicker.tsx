'use client'

import { Checkbox } from '@/components/ds/checkbox'
import { roleLabel } from '@/lib/access'

export interface RoleOption {
  id: string
  name: string
  department_key: string | null
  rank: 'director' | 'employee' | null
}

/**
 * Pick one or more roles. A person with two roles gets both departments' pages;
 * their department and level are worked out from the roles, so there is nothing else to set.
 */
export function RolePicker({
  roles,
  value,
  onChange,
  deptLabels,
}: {
  roles: RoleOption[]
  value: string[]
  onChange: (ids: string[]) => void
  /** Department key -> its name in the viewer's language. */
  deptLabels: Record<string, string>
}) {
  const groups = new Map<string, RoleOption[]>()
  for (const r of roles) {
    const key = r.department_key ?? ''
    groups.set(key, [...(groups.get(key) ?? []), r])
  }
  // Company-wide roles first, then each department.
  const ordered = [...groups.entries()].sort(([a], [b]) => (a === '' ? -1 : b === '' ? 1 : a.localeCompare(b)))

  return (
    <div className="space-y-3">
      {ordered.map(([dept, list]) => (
        <div key={dept} className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">{dept ? (deptLabels[dept] ?? dept) : 'Company'}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {list.map((r) => (
              <label key={r.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={value.includes(r.id)}
                  onCheckedChange={(on) => onChange(on ? [...value, r.id] : value.filter((id) => id !== r.id))}
                />
                {roleLabel(r.name)}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
