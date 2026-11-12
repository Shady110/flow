'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { PhoneCall } from 'lucide-react'
import { logContactAction } from '@/lib/db/lead-actions'
import { CONTACT_METHODS, LEAD_STATUSES } from '@/lib/constants'
import { Button } from '@/components/ds/button'
import { Label } from '@/components/ds/label'
import { Textarea } from '@/components/ds/textarea'
import { StageSelect } from '@/components/flow/StageSelect'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ds/dialog'
import type { ContactMethod, LeadStatus } from '@/lib/types'

/** "I just called / messaged this lead" — how, what happened, and where it stands now. */
export function LogContactDialog({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const router = useRouter()
  const t = useTranslations('internal.leads')
  const ts = useTranslations('internal.leadStatus')
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState<ContactMethod>('call')
  const [note, setNote] = useState('')
  const [after, setAfter] = useState<LeadStatus | 'same'>('same')
  const [pending, startTransition] = useTransition()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><PhoneCall className="h-4 w-4" /> {t('logContact')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{t('logContact')}</DialogTitle></DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            startTransition(async () => {
              const res = await logContactAction({
                leadId, method, note, status: after === 'same' ? null : after,
              })
              if (!res.ok) return void toast.error(res.error)
              toast.success(t('contactLogged'))
              setOpen(false)
              setNote('')
              setAfter('same')
              router.refresh()
            })
          }}
        >
          <div className="space-y-1">
            <Label>{t('method')}</Label>
            <StageSelect value={method} label={t('method')}
              options={CONTACT_METHODS.map((m) => ({ value: m, label: t(`method_${m}`) }))}
              onChange={setMethod} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="contact-note">{t('whatHappened')}</Label>
            <Textarea id="contact-note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t('statusAfter')}</Label>
            <StageSelect value={after} label={t('statusAfter')}
              options={[
                { value: 'same', label: t('keepStatus', { status: ts(status) }) },
                ...LEAD_STATUSES.filter((s) => s !== status).map((s) => ({ value: s as LeadStatus | 'same', label: ts(s) })),
              ]}
              onChange={setAfter} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>{t('saveContact')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
