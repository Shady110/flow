'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { updateClientUserAction } from '@/lib/db/client-user-actions'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { PasswordResetPanel } from '@/components/dashboard/PasswordResetPanel'
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
import type { ClientUser } from '@/lib/types'

export function EditClientUserDialog({ user }: { user: ClientUser }) {
  const router = useRouter()
  const t = useTranslations('internal.clientDetail')
  const tc = useTranslations('internal.common')
  const tcs = useTranslations('internal.clientStatus')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState(user.full_name)
  const [roleAtCompany, setRoleAtCompany] = useState(user.role_at_company ?? '')
  const [status, setStatus] = useState(user.status === 'disabled' ? 'disabled' : 'active')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await updateClientUserAction(user.id, user.client_id, {
      fullName,
      roleAtCompany,
      status,
    })
    setLoading(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success(t('userUpdated'))
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          {tc('edit')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('editPortalUser')}</DialogTitle>
          <DialogDescription>{t('emailImmutable', { email: user.email })}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cu-name">{t('fullName')}</Label>
            <Input
              id="cu-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cu-role">{t('roleAtCompany')}</Label>
            <Input
              id="cu-role"
              value={roleAtCompany}
              onChange={(e) => setRoleAtCompany(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('status')}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{tcs('active')}</SelectItem>
                <SelectItem value="disabled">{t('disabled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? tc('saving') : tc('save')}
            </Button>
          </DialogFooter>
        </form>
        {user.user_id && <PasswordResetPanel userId={user.user_id} />}
      </DialogContent>
    </Dialog>
  )
}
