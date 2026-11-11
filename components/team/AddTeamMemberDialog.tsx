'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import { createAdminAction } from '@/lib/db/role-actions'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ds/dialog'
import { CredentialsCard } from '@/components/dashboard/CredentialsCard'
import { RolePicker, type RoleOption } from '@/components/team/RolePicker'

/** Add a person: name, email and one or more roles. They get a one-time password to replace at first sign-in. */
export function AddTeamMemberDialog({ roles, deptLabels }: { roles: RoleOption[]; deptLabels: Record<string, string> }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [roleIds, setRoleIds] = useState<string[]>([])
  const [creds, setCreds] = useState<{ password: string; signInUrl?: string } | null>(null)
  const [pending, start] = useTransition()

  function close() {
    setOpen(false)
    setFullName('')
    setEmail('')
    setRoleIds([])
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
          <DialogDescription>Their roles decide what they can do and where they start.</DialogDescription>
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
                const res = await createAdminAction({ email, roleIds, fullName })
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
              <Label>Roles</Label>
              <RolePicker roles={roles} value={roleIds} onChange={setRoleIds} deptLabels={deptLabels} />
            </div>
            <DialogFooter><Button type="submit" disabled={pending || roleIds.length === 0}>{pending ? 'Creating…' : 'Create account'}</Button></DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
