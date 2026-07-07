'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createClientAction } from '@/lib/db/client-actions'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ds/dialog'
import { CLIENT_STATUS_LABELS } from '@/lib/constants'
import type { ClientStatus } from '@/lib/types'

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
}

export function NewClientDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [status, setStatus] = useState<ClientStatus>('lead')
  const [notes, setNotes] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await createClientAction({ name, slug, status, notes })
    setLoading(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success('Client created')
    setOpen(false)
    setName('')
    setSlug('')
    setSlugTouched(false)
    setNotes('')
    setStatus('lead')
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> New client
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New client</DialogTitle>
          <DialogDescription>Each client gets their own portal subdomain.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="c-name">Company name</Label>
            <Input
              id="c-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!slugTouched) setSlug(slugify(e.target.value))
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-slug">Subdomain</Label>
            <div className="flex items-center gap-2">
              <Input
                id="c-slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setSlug(slugify(e.target.value))
                }}
                required
              />
              <span className="whitespace-nowrap text-sm text-muted-foreground">.flow…</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ClientStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CLIENT_STATUS_LABELS) as ClientStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {CLIENT_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-notes">Notes</Label>
            <Textarea id="c-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
