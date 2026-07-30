'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRightLeft, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { convertLeadAction } from '@/lib/db/lead-actions'
import { Button } from '@/components/ds/button'
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
import type { Lead } from '@/lib/types'

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
}

export function ConvertLeadDialog({ lead }: { lead: Lead }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<{ clientId: string; tempPassword?: string } | null>(null)

  const defaultName = lead.company || lead.name
  const [name, setName] = useState(defaultName)
  const [slug, setSlug] = useState(slugify(defaultName))
  const [contactEmail, setContactEmail] = useState(lead.email ?? '')
  const [contactName, setContactName] = useState(lead.name)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await convertLeadAction({ leadId: lead.id, slug, name, contactEmail, contactName })
    setLoading(false)
    if (!res.ok) {
      toast.error(res.error)
      router.refresh()
      return
    }
    toast.success('Lead converted to a client')
    setDone({ clientId: res.clientId!, tempPassword: res.tempPassword })
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ArrowRightLeft className="h-4 w-4" /> Convert to client
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert “{lead.name}” to a client</DialogTitle>
          <DialogDescription>
            Creates the client record and its portal, copies the lead&apos;s details into the client
            notes, and marks the lead won.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="space-y-4">
            {done.tempPassword ? (
              <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-sm font-medium">One-time portal password</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded bg-background px-2 py-1.5 text-sm">
                    {done.tempPassword}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(done.tempPassword!)
                      toast.success('Copied')
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Shown once — send it to {contactEmail} now.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Client created without a portal login. Add users from the client page when you have
                their email.
              </p>
            )}
            <DialogFooter>
              <Button onClick={() => router.push(`/clients/${done.clientId}`)}>
                Open the client
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cv-name">Client name</Label>
              <Input id="cv-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cv-slug">Subdomain</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="cv-slug"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  required
                />
                <span className="whitespace-nowrap text-sm text-muted-foreground">.flow…</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cv-cname">Portal contact</Label>
                <Input
                  id="cv-cname"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cv-cemail">Portal email</Label>
                <Input
                  id="cv-cemail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Leave empty to skip"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Converting…' : 'Convert'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
