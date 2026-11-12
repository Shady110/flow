'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { createTicketAction } from '@/lib/db/ticket-actions'
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '@/lib/tickets'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { Textarea } from '@/components/ds/textarea'
import { StageSelect } from '@/components/flow/StageSelect'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ds/dialog'
import type { Marketplace } from '@/lib/types'

export interface TicketPlatformOption { id: string; platform: Marketplace; label: string }

/**
 * Open a ticket: pick the account, what it's about, and describe it.
 * Staff also set a priority (their "offline" tickets); clients don't.
 */
export function NewTicketDialog({
  platforms,
  baseHref,
  staff = false,
}: {
  platforms: TicketPlatformOption[]
  /** Where tickets are shown, to jump to the new one: "/tickets" or "/accounts/tickets". */
  baseHref: string
  staff?: boolean
}) {
  const router = useRouter()
  const t = useTranslations('internal.tickets')
  const [open, setOpen] = useState(false)
  const [platformId, setPlatformId] = useState(platforms[0]?.id ?? '')
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [priority, setPriority] = useState('normal')
  const [pending, startTransition] = useTransition()

  const platform = platforms.find((p) => p.id === platformId)
  const categories = platform ? TICKET_CATEGORIES[platform.platform] : []

  if (platforms.length === 0) return null
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> {t('newTicket')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{staff ? t('newOfflineTicket') : t('newTicket')}</DialogTitle></DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            startTransition(async () => {
              const res = await createTicketAction({
                platformId, category, title, body, ...(staff ? { priority } : {}),
              })
              if (!res.ok) return void toast.error(res.error)
              toast.success(t('created'))
              setOpen(false)
              setTitle(''); setBody(''); setCategory('')
              router.push(`${baseHref}/${res.id}`)
              router.refresh()
            })
          }}
        >
          {platforms.length > 1 && (
            <div className="space-y-1">
              <Label>{t('account')}</Label>
              <StageSelect value={platformId} label={t('account')}
                options={platforms.map((p) => ({ value: p.id, label: p.label }))}
                onChange={(v) => { setPlatformId(v); setCategory('') }} />
            </div>
          )}
          <div className="space-y-1">
            <Label>{t('category')}</Label>
            <StageSelect value={category || 'pick'} label={t('category')}
              options={[{ value: 'pick', label: t('pickCategory') }, ...categories.map((c) => ({ value: c, label: t(`categories.${c}`) }))]}
              onChange={(v) => setCategory(v === 'pick' ? '' : v)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tk-title">{t('subject')}</Label>
            <Input id="tk-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tk-body">{t('details')}</Label>
            <Textarea id="tk-body" rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          {staff && (
            <div className="space-y-1">
              <Label>{t('priority')}</Label>
              <StageSelect value={priority} label={t('priority')}
                options={TICKET_PRIORITIES.map((p) => ({ value: p as string, label: t(`priorities.${p}`) }))}
                onChange={setPriority} />
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending || !category || title.trim().length < 3}>{t('open')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
