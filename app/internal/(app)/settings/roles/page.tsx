import { requirePermission } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { getTeam } from '@/lib/db/queries'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { RolesManager } from '@/components/dashboard/RolesManager'
import type { Permission, PermissionKey } from '@/lib/types'

interface RoleRow {
  id: string
  name: string
  description: string | null
  is_system: boolean
  role_permissions: { permission_key: PermissionKey }[]
}

export default async function RolesPage() {
  await requirePermission('roles.manage')
  const supabase = await createClient()

  const [{ data: roles }, { data: permissions }, team] = await Promise.all([
    supabase
      .from('roles')
      .select('id, name, description, is_system, role_permissions(permission_key)')
      .order('is_system', { ascending: false })
      .order('name'),
    supabase.from('permissions').select('*').order('category'),
    getTeam(),
  ])

  const roleList = (roles ?? []).map((r: RoleRow) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    is_system: r.is_system,
    permissions: r.role_permissions.map((p) => p.permission_key),
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles &amp; access"
        description="Define what each role can do and manage admin accounts."
      />
      <RolesManager
        roles={roleList}
        permissions={(permissions as Permission[]) ?? []}
        team={team.map((m) => ({
          id: m.id,
          name: m.full_name ?? m.id,
          role_id: m.role_id,
          status: m.status,
        }))}
      />
    </div>
  )
}
