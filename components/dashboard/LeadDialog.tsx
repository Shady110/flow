'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createLeadAction, updateLeadAction } from '@/lib/db/lead-actions'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { Textarea } from '@/components/ds/textarea'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ds/dialog'
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from '@/lib/constants'
import type { Lead, LeadStatus } from '@/lib/types'

const NO_OWNER = '__none__'

export function LeadDialog({
  team,
  lead,
  trigger,
}: {
  team: { id: string; label: string }[]
  lead?: Lead
  trigger?: React.ReactNode
}) {
  const router = useRouter()
  const editing = !!lead
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: lead?.name ?? '',
    company: lead?.company ?? '',
    email: lead?.email ?? '',
    phone: lead?.phone ?? '',
    address: lead?.address ?? '',
    area: lead?.area ?? '',
    field: lead?.field ?? '',
    status: (lead?.status ?? 'new') as LeadStatus,
    source: lead?.source ?? 'manual',
    plan_interest: lead?.plan_interest ?? '',
    notes: lead?.notes ?? '',
    owner_id: lead?.owner_id ?? NO_OWNER,
  })

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, owner_id: form.owner_id === NO_OWNER ? null : form.owner_id }
    const res = editing ? await updateLeadAction(lead!.id, payload) : await createLeadAction(payload)
    setLoading(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success(editing ? 'Lead updated' : 'Lead added')
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4" /> New lead
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit lead' : 'New lead'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="l-name">Contact name</Label>
              <Input id="l-name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="l-company">Company</Label>
              <Input id="l-company" value={form.company} onChange={(e) => set('company', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="l-email">Email</Label>
              <Input id="l-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="l-phone">Phone</Label>
              <Input id="l-phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="l-address">Address</Label>
            <Input id="l-address" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="l-area">Area</Label>
              <Input
                id="l-area"
                value={form.area}
                onChange={(e) => set('area', e.target.value)}
                placeholder="Nasr City, Alexandria…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="l-field">Field</Label>
              <Input
                id="l-field"
                value={form.field}
                onChange={(e) => set('field', e.target.value)}
                placeholder="Home appliances, fashion…"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v as LeadStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {LEAD_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Owner</Label>
              <Select value={form.owner_id} onValueChange={(v) => set('owner_id', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_OWNER}>Unassigned</SelectItem>
                  {team.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="l-plan">Interested in</Label>
              <Input
                id="l-plan"
                value={form.plan_interest}
                onChange={(e) => set('plan_interest', e.target.value)}
                placeholder="Growth plan, photography…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="l-source">Source</Label>
              <Input id="l-source" value={form.source} onChange={(e) => set('source', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="l-notes">Notes</Label>
            <Textarea id="l-notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : editing ? 'Save changes' : 'Add lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
