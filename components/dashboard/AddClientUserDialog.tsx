'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { createClientUserAction } from '@/lib/db/client-user-actions'
import { Button } from '@/components/ds/button'
import { CredentialsCard } from '@/components/dashboard/CredentialsCard'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ds/dialog'

export function AddClientUserDialog({ clientId }: { clientId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [roleAtCompany, setRoleAtCompany] = useState('')
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [signInUrl, setSignInUrl] = useState<string | undefined>()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await createClientUserAction({ clientId, email, fullName, roleAtCompany })
    setLoading(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    setTempPassword(res.tempPassword ?? null)
    setSignInUrl(res.signInUrl)
    toast.success('Client user created')
    router.refresh()
  }

  function close() {
    setOpen(false)
    setFullName('')
    setEmail('')
    setRoleAtCompany('')
    setTempPassword(null)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <UserPlus className="h-4 w-4" /> Add user
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add portal user</DialogTitle>
          <DialogDescription>
            Gives this person access to the client&apos;s portal and private chat.
          </DialogDescription>
        </DialogHeader>

        {tempPassword ? (
          <div className="space-y-3">
            <CredentialsCard kind="client" signInUrl={signInUrl} email={email} password={tempPassword} />
            <DialogFooter>
              <Button onClick={close}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cu-name">Full name</Label>
              <Input id="cu-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cu-email">Email</Label>
              <Input id="cu-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cu-role">Role at company (optional)</Label>
              <Input id="cu-role" value={roleAtCompany} onChange={(e) => setRoleAtCompany(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating…' : 'Create user'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
