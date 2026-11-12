'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowRightLeft } from 'lucide-react'
import { toast } from 'sonner'
import { convertLeadAction } from '@/lib/db/lead-actions'
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
import type { Lead } from '@/lib/types'

export function ConvertLeadDialog({ lead }: { lead: Lead }) {
  const router = useRouter()
  const t = useTranslations('internal.leads')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<{ clientId: string; tempPassword?: string; signInUrl?: string } | null>(null)

  const defaultName = lead.company || lead.name
  const [name, setName] = useState(defaultName)
  const [contactEmail, setContactEmail] = useState(lead.email ?? '')
  const [contactName, setContactName] = useState(lead.name)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await convertLeadAction({ leadId: lead.id, name, contactEmail, contactName })
    setLoading(false)
    if (!res.ok) {
      toast.error(res.error)
      router.refresh()
      return
    }
    toast.success(t('converted'))
    setDone({ clientId: res.clientId!, tempPassword: res.tempPassword, signInUrl: res.signInUrl })
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ArrowRightLeft className="h-4 w-4" /> {t('convert')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('convertTitle', { name: lead.name })}</DialogTitle>
          <DialogDescription>{t('convertDesc')}</DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="space-y-4">
            {done.tempPassword ? (
              <CredentialsCard kind="client" signInUrl={done.signInUrl} email={contactEmail} password={done.tempPassword} />
            ) : (
              <p className="text-sm text-muted-foreground">{t('noPortalLogin')}</p>
            )}
            <DialogFooter>
              <Button onClick={() => router.push(`/clients/${done.clientId}`)}>
                {t('openTheClient')}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cv-name">{t('clientName')}</Label>
              <Input id="cv-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cv-cname">{t('portalContact')}</Label>
                <Input
                  id="cv-cname"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cv-cemail">{t('portalEmail')}</Label>
                <Input
                  id="cv-cemail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder={t('portalEmailPlaceholder')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? t('converting') : t('convertCta')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
