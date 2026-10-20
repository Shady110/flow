'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import {
  createRoleAction,
  deleteRoleAction,
  setRolePermissionsAction,
  assignRoleAction,
} from '@/lib/db/role-actions'
import type { Permission, PermissionKey } from '@/lib/types'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { Checkbox } from '@/components/ds/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import { Badge } from '@/components/ds/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ds/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ds/dialog'
import { cn } from '@/lib/utils'

interface RoleVM {
  id: string
  name: string
  description: string | null
  is_system: boolean
  permissions: PermissionKey[]
}
interface Member {
  id: string
  name: string
  role_id: string | null
  status: string
}

export function RolesManager({
  roles,
  permissions,
  team,
}: {
  roles: RoleVM[]
  permissions: Permission[]
  team: Member[]
}) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState(roles[0]?.id ?? '')
  const selected = roles.find((r) => r.id === selectedId) ?? roles[0]

  const grouped = useMemo(() => {
    const map = new Map<string, Permission[]>()
    for (const p of permissions) {
      if (!map.has(p.category)) map.set(p.category, [])
      map.get(p.category)!.push(p)
    }
    return [...map.entries()]
  }, [permissions])

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
      {/* Role list */}
      <div className="space-y-3">
        <div className="space-y-1">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm transition-colors',
                r.id === selectedId
                  ? 'bg-secondary text-secondary-foreground'
                  : 'hover:bg-muted',
              )}
            >
              <span className="capitalize">{r.name}</span>
              {r.is_system && <Lock className="h-3 w-3 text-muted-foreground" />}
            </button>
          ))}
        </div>
        <NewRoleDialog onDone={() => router.refresh()} />
      </div>

      {/* Permission matrix + team */}
      <div className="space-y-6">
        {selected && (
          <PermissionMatrix
            key={selected.id}
            role={selected}
            grouped={grouped}
            onSaved={() => router.refresh()}
          />
        )}

        <TeamPanel team={team} roles={roles} onChange={() => router.refresh()} />
      </div>
    </div>
  )
}

function PermissionMatrix({
  role,
  grouped,
  onSaved,
}: {
  role: RoleVM
  grouped: [string, Permission[]][]
  onSaved: () => void
}) {
  const [checked, setChecked] = useState<Set<PermissionKey>>(new Set(role.permissions))
  const [pending, startTransition] = useTransition()
  const locked = role.name === 'co-founder' // always all-access

  function toggle(key: PermissionKey) {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function save() {
    startTransition(async () => {
      const res = await setRolePermissionsAction(role.id, [...checked])
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success('Permissions saved')
      onSaved()
    })
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base capitalize">{role.name}</CardTitle>
          {role.description && (
            <p className="mt-1 text-sm text-muted-foreground">{role.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {role.is_system && <Badge variant="secondary">System</Badge>}
          {!locked && (
            <Button size="sm" onClick={save} disabled={pending}>
              {pending ? 'Saving…' : 'Save'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {locked && (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            Co-founders always have full access.
          </p>
        )}
        {grouped.map(([category, perms]) => (
          <div key={category}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {category}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {perms.map((p) => (
                <label
                  key={p.key}
                  className={cn(
                    'flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm',
                    locked ? 'opacity-60' : 'cursor-pointer',
                  )}
                >
                  <Checkbox
                    checked={locked ? true : checked.has(p.key)}
                    disabled={locked}
                    onCheckedChange={() => toggle(p.key)}
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {!role.is_system && (
          <DeleteRoleButton roleId={role.id} onDeleted={onSaved} />
        )}
      </CardContent>
    </Card>
  )
}

function DeleteRoleButton({ roleId, onDeleted }: { roleId: string; onDeleted: () => void }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await deleteRoleAction(roleId)
          if (!res.ok) {
        toast.error(res.error)
        return
      }
          toast.success('Role deleted')
          onDeleted()
        })
      }
    >
      <Trash2 className="h-4 w-4" /> Delete role
    </Button>
  )
}

function NewRoleDialog({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await createRoleAction({ name, description })
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success('Role created')
      setOpen(false)
      setName('')
      setDescription('')
      onDone()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4" /> New role
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New role</DialogTitle>
          <DialogDescription>Start with no permissions, then tick what it can do.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="r-name">Name</Label>
            <Input id="r-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="r-desc">Description</Label>
            <Input id="r-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TeamPanel({
  team,
  roles,
  onChange,
}: {
  team: Member[]
  roles: RoleVM[]
  onChange: () => void
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Admin accounts</CardTitle>
        <Link href="/team" className="text-sm font-medium text-flow-green hover:underline">Add people on the Team page</Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {team.length === 0 && (
          <p className="text-sm text-muted-foreground">No admins yet.</p>
        )}
        {team.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{m.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{m.status}</p>
            </div>
            <RoleAssign profileId={m.id} roleId={m.role_id} roles={roles} onDone={onChange} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function RoleAssign({
  profileId,
  roleId,
  roles,
  onDone,
}: {
  profileId: string
  roleId: string | null
  roles: RoleVM[]
  onDone: () => void
}) {
  const [pending, startTransition] = useTransition()
  return (
    <Select
      value={roleId ?? ''}
      onValueChange={(v) =>
        startTransition(async () => {
          const res = await assignRoleAction(profileId, v)
          if (!res.ok) {
        toast.error(res.error)
        return
      }
          toast.success('Role updated')
          onDone()
        })
      }
      disabled={pending}
    >
      <SelectTrigger className="h-8 w-[150px] text-xs capitalize">
        <SelectValue placeholder="No role" />
      </SelectTrigger>
      <SelectContent>
        {roles.map((r) => (
          <SelectItem key={r.id} value={r.id} className="text-xs capitalize">
            {r.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
