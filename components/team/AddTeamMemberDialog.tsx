'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import { createAdminAction } from '@/lib/db/role-actions'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ds/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ds/dialog'
import { CredentialsCard } from '@/components/dashboard/CredentialsCard'
import { LevelPicker } from '@/components/team/LevelPicker'
import type { Level } from '@/lib/org'

export interface DepartmentOption { key: string; label: string }
export interface RoleOption { id: string; name: string }

/** Add a person: name, email, department, level and role. They get a one-time password to replace at first sign-in. */
export function AddTeamMemberDialog({ departments, roles }: { departments: DepartmentOption[]; roles: RoleOption[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [departmentKey, setDepartmentKey] = useState(departments[0]?.key ?? '')
  const [level, setLevel] = useState<Level>('member')
  const [roleId, setRoleId] = useState(roles.find((r) => r.name === 'admin')?.id ?? roles[0]?.id ?? '')
  const [creds, setCreds] = useState<{ password: string; signInUrl?: string } | null>(null)
  const [pending, start] = useTransition()

  function close() {
    setOpen(false)
    setFullName('')
    setEmail('')
    setCreds(null)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <DialogTrigger asChild>
        <Button><UserPlus className="h-4 w-4" /> Add team member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add team member</DialogTitle>
          <DialogDescription>Their department decides where they start; their role decides what they can do.</DialogDescription>
        </DialogHeader>
        {creds ? (
          <div className="space-y-3">
            <CredentialsCard kind="staff" signInUrl={creds.signInUrl} email={email} password={creds.password} />
            <DialogFooter><Button onClick={close}>Done</Button></DialogFooter>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              start(async () => {
                const res = await createAdminAction({ email, roleId, fullName, departmentKey, level })
                if (!res.ok) return void toast.error(res.error)
                setCreds({ password: res.tempPassword ?? '', signInUrl: res.signInUrl })
                toast.success('Team member created')
                router.refresh()
              })
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="tm-name">Full name</Label>
              <Input id="tm-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tm-email">Email</Label>
              <Input id="tm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={departmentKey} onValueChange={setDepartmentKey}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{departments.map((d) => <SelectItem key={d.key} value={d.key}>{d.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <LevelPicker value={level} onChange={setLevel} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{roles.map((r) => <SelectItem key={r.id} value={r.id} className="capitalize">{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <DialogFooter><Button type="submit" disabled={pending}>{pending ? 'Creating…' : 'Create account'}</Button></DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
