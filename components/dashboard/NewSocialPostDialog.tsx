'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createSocialPostAction } from '@/lib/db/social-actions'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
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
import { SOCIAL_PLATFORMS, SOCIAL_PILLARS, SOCIAL_FORMATS } from '@/lib/constants'
import type { SocialCampaign, SocialPlatform, SocialPillar, SocialFormat } from '@/lib/types'

const NO_CAMPAIGN = '__none__'

/**
 * Creating a post asks for the five things that decide what it is, and nothing
 * else. Captions, design and scheduling all happen on the post's own page —
 * asking for them here would mean a form nobody finishes in one sitting.
 */
export function NewSocialPostDialog({ campaigns }: { campaigns: SocialCampaign[] }) {
  const router = useRouter()
  const t = useTranslations('internal.social')
  const tc = useTranslations('internal.common')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    hook: '',
    platform: 'instagram' as SocialPlatform,
    pillar: 'teach' as SocialPillar,
    format: 'carousel' as SocialFormat,
    scheduled_at: '',
    campaign_id: NO_CAMPAIGN,
  })

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await createSocialPostAction({
      ...form,
      campaign_id: form.campaign_id === NO_CAMPAIGN ? null : form.campaign_id,
      // A datetime-local value has no zone; treat it as the browser's, which is
      // the zone the person picking it is thinking in.
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      status: 'idea',
    })
    setLoading(false)

    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success(t('created'))
    setOpen(false)
    setForm((f) => ({ ...f, hook: '', scheduled_at: '' }))
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          {t('newPost')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('newPost')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="hook">{t('hook')}</Label>
            <Input
              id="hook"
              value={form.hook}
              onChange={(e) => set('hook', e.target.value)}
              placeholder={t('hookPlaceholder')}
              required
            />
            <p className="text-xs text-muted-foreground">{t('hookHelp')}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>{t('platform')}</Label>
              <Select value={form.platform} onValueChange={(v) => set('platform', v as SocialPlatform)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOCIAL_PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>{t(`platformName.${p}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{t('pillar')}</Label>
              <Select value={form.pillar} onValueChange={(v) => set('pillar', v as SocialPillar)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOCIAL_PILLARS.map((p) => (
                    <SelectItem key={p} value={p}>{t(`pillarName.${p}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{t('format')}</Label>
              <Select value={form.format} onValueChange={(v) => set('format', v as SocialFormat)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOCIAL_FORMATS.map((f) => (
                    <SelectItem key={f} value={f}>{t(`formatName.${f}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="when">{t('scheduledAt')}</Label>
              <Input
                id="when"
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => set('scheduled_at', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{t('scheduledOptional')}</p>
            </div>

            <div className="space-y-1.5">
              <Label>{t('campaign')}</Label>
              <Select value={form.campaign_id} onValueChange={(v) => set('campaign_id', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CAMPAIGN}>{tc('none')}</SelectItem>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {tc('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? tc('saving') : tc('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
