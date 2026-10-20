'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { assignRoleAction, updateProfileAction } from '@/lib/db/role-actions'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ds/select'
import { PasswordResetPanel } from '@/components/dashboard/PasswordResetPanel'
import { LevelPicker } from '@/components/team/LevelPicker'
import type { DepartmentOption, RoleOption } from '@/components/team/AddTeamMemberDialog'
import type { Level } from '@/lib/org'
import type { ProfileStatus } from '@/lib/types'

/** The side panel for one person: department, level, role, status, locked-out help and recent sign-ins. */
export function TeamEditPanel({
  person,
  departments,
  roles,
  activity,
  closeHref,
}: {
  person: { id: string; name: string; email: string; department_key: string | null; level: Level | null; role_id: string | null; status: ProfileStatus }
  departments: DepartmentOption[]
  roles: RoleOption[]
  activity: { id: string; label: string; when: string }[]
  closeHref: string
}) {
  const router = useRouter()
  const [name, setName] = useState(person.name)
  const [dept, setDept] = useState(person.department_key ?? '')
  const [level, setLevel] = useState<Level>(person.level ?? 'member')
  const [roleId, setRoleId] = useState(person.role_id ?? '')
  const [status, setStatus] = useState<ProfileStatus>(person.status)
  const [pending, start] = useTransition()

  function save() {
    start(async () => {
      const res = await updateProfileAction(person.id, {
        full_name: name,
        status,
        ...(dept ? { department_key: dept } : {}),
        level,
      })
      if (!res.ok) return void toast.error(res.error)
      if (roleId && roleId !== person.role_id) {
        const r = await assignRoleAction(person.id, roleId)
        if (!r.ok) return void toast.error(r.error)
      }
      toast.success('Saved')
      router.refresh()
    })
  }

  return (
    <aside className="w-full shrink-0 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-md)] lg:w-[360px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">{person.name}</h2>
          <p className="text-sm text-muted-foreground" dir="ltr">{person.email}</p>
        </div>
        <Button asChild variant="ghost" size="sm" aria-label="Close"><Link href={closeHref}><X className="h-4 w-4" /></Link></Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="te-name">Full name</Label>
        <Input id="te-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Department</Label>
        <Select value={dept} onValueChange={setDept}>
          <SelectTrigger><SelectValue placeholder="Not set" /></SelectTrigger>
          <SelectContent>{departments.map((d) => <SelectItem key={d.key} value={d.key}>{d.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Level</Label>
        <LevelPicker value={level} onChange={setLevel} />
      </div>
      <div className="space-y-2">
        <Label>Role (what they can do)</Label>
        <Select value={roleId} onValueChange={setRoleId}>
          <SelectTrigger className="capitalize"><SelectValue placeholder="No role" /></SelectTrigger>
          <SelectContent>{roles.map((r) => <SelectItem key={r.id} value={r.id} className="capitalize">{r.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as ProfileStatus)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="invited">Invited</SelectItem>
            <SelectItem value="disabled">Disabled (cannot sign in)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={save} disabled={pending} className="w-full">{pending ? 'Saving…' : 'Save changes'}</Button>
      <PasswordResetPanel userId={person.id} />
      <div className="space-y-2 border-t border-border pt-4">
        <p className="text-sm font-medium">Recent sign-ins</p>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {activity.map((a) => (
              <li key={a.id} className="flex justify-between gap-3 rounded-lg bg-muted/50 px-3 py-1.5">
                <span>{a.label}</span><span className="text-muted-foreground">{a.when}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
