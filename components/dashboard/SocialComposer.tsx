'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Sparkles, Copy, Check, ExternalLink } from 'lucide-react'
import {
  updateSocialPostAction,
  setSocialPostStatusAction,
  generateCaptionAction,
} from '@/lib/db/social-actions'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { Textarea } from '@/components/ds/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ds/select'
import { SOCIAL_POST_STATUSES } from '@/lib/constants'
import { TEMPLATES, SIZES } from '@/lib/social/templates'
import type { SocialPost, SocialCampaign, SocialPostStatus } from '@/lib/types'

/**
 * Instagram and Facebook are portrait-first; LinkedIn's feed card is wide.
 * Defaulting per platform saves a decision on every single post.
 */
const DEFAULT_SIZE = {
  instagram: 'portrait',
  facebook: 'square',
  linkedin: 'wide',
} as const

export function SocialComposer({
  post,
  campaigns,
  canEdit,
  canPublish,
}: {
  post: SocialPost
  campaigns: SocialCampaign[]
  canEdit: boolean
  canPublish: boolean
}) {
  const router = useRouter()
  const t = useTranslations('internal.social')
  const tc = useTranslations('internal.common')

  const [saving, setSaving] = useState(false)
  const [drafting, setDrafting] = useState(false)
  const [copied, setCopied] = useState<'en' | 'ar' | null>(null)

  const [form, setForm] = useState({
    caption_en: post.caption_en ?? '',
    caption_ar: post.caption_ar ?? '',
    hashtags: (post.hashtags ?? []).join(' '),
    design_brief: post.design_brief ?? '',
    template: post.template ?? 'statement-dark',
    link_url: post.link_url ?? '',
    scheduled_at: post.scheduled_at ? toLocalInput(post.scheduled_at) : '',
  })

  const [size, setSize] = useState<keyof typeof SIZES>(DEFAULT_SIZE[post.platform])

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function save() {
    setSaving(true)
    const res = await updateSocialPostAction(post.id, {
      ...form,
      hashtags: form.hashtags.split(/\s+/).filter(Boolean),
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      // utm_content is the post id, which is what makes lead attribution work
      // without anyone having to invent and remember a tag per post.
      utm_content: post.id,
    })
    setSaving(false)
    res.ok ? (toast.success(tc('saved')), router.refresh()) : toast.error(res.error)
  }

  async function draft() {
    setDrafting(true)
    const res = await generateCaptionAction(post.id)
    setDrafting(false)
    if (!res.ok) return toast.error(res.error)
    toast.success(t('drafted'))
    router.refresh()
  }

  async function move(status: SocialPostStatus) {
    const res = await setSocialPostStatusAction(post.id, status)
    res.ok ? (toast.success(tc('saved')), router.refresh()) : toast.error(res.error)
  }

  async function copy(which: 'en' | 'ar') {
    await navigator.clipboard.writeText(which === 'en' ? form.caption_en : form.caption_ar)
    setCopied(which)
    setTimeout(() => setCopied(null), 1600)
  }

  const renderUrl = `/api/social/render?template=${form.template}&size=${size}&headline=${encodeURIComponent(
    post.hook,
  )}&kicker=${encodeURIComponent(t(`pillarName.${post.pillar}`))}`

  // The link a post actually carries. Attribution depends on utm_content being
  // the post id, so it is built here rather than typed by hand.
  const trackedLink = form.link_url
    ? `${form.link_url}${form.link_url.includes('?') ? '&' : '?'}utm_source=${post.platform}&utm_medium=social&utm_campaign=${
        post.campaign_id ? (campaigns.find((c) => c.id === post.campaign_id)?.slug ?? 'organic') : 'organic'
      }&utm_content=${post.id}`
    : ''

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* ── Copy ─────────────────────────────────────────────────────────── */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>{t('copy')}</CardTitle>
            {canEdit && (
              <Button size="sm" variant="outline" onClick={draft} disabled={drafting}>
                <Sparkles className="h-4 w-4" />
                {drafting ? t('drafting') : t('draftWithAi')}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="en">{t('captionEn')}</Label>
                <Button size="sm" variant="ghost" onClick={() => copy('en')} disabled={!form.caption_en}>
                  {copied === 'en' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {tc('copy')}
                </Button>
              </div>
              <Textarea
                id="en"
                rows={8}
                value={form.caption_en}
                onChange={(e) => set('caption_en', e.target.value)}
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="ar">{t('captionAr')}</Label>
                <Button size="sm" variant="ghost" onClick={() => copy('ar')} disabled={!form.caption_ar}>
                  {copied === 'ar' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {tc('copy')}
                </Button>
              </div>
              {/* Explicit RTL: the Arabic caption is authored here, and typing
                  it in a left-aligned box makes punctuation land wrong. */}
              <Textarea
                id="ar"
                dir="rtl"
                rows={8}
                value={form.caption_ar}
                onChange={(e) => set('caption_ar', e.target.value)}
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tags">{t('hashtags')}</Label>
              <Input
                id="tags"
                value={form.hashtags}
                onChange={(e) => set('hashtags', e.target.value)}
                placeholder="#ecommerceegypt #amazoneg"
                disabled={!canEdit}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('design')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t('template')}</Label>
                <Select value={form.template} onValueChange={(v) => set('template', v)} disabled={!canEdit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map((tpl) => (
                      <SelectItem key={tpl} value={tpl}>{tpl}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('size')}</Label>
                <Select value={size} onValueChange={(v) => setSize(v as keyof typeof SIZES)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SIZES).map(([key, dim]) => (
                      <SelectItem key={key} value={key}>
                        {key} · {dim.width}×{dim.height}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brief">{t('designBrief')}</Label>
              <Textarea
                id="brief"
                rows={3}
                value={form.design_brief}
                onChange={(e) => set('design_brief', e.target.value)}
                disabled={!canEdit}
              />
            </div>

            {/* Rendered live from the design system, so what is previewed here
                is the file itself rather than an approximation of it. */}
            <div className="space-y-2">
              <div className="overflow-hidden rounded-lg border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={renderUrl} alt={t('preview')} className="h-auto w-full" />
              </div>
              <a
                href={renderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" />
                {t('openFullSize')}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Publishing ───────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>{t('publishing')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('status')}</Label>
              <Select
                value={post.status}
                onValueChange={(v) => move(v as SocialPostStatus)}
                disabled={!canEdit}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOCIAL_POST_STATUSES.map((s) => (
                    <SelectItem
                      key={s}
                      value={s}
                      // Scheduling and publishing put something in front of the
                      // company's audience unattended. Different trust level.
                      disabled={(s === 'scheduled' || s === 'published') && !canPublish}
                    >
                      {t(`statusName.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!canPublish && (
                <p className="text-xs text-muted-foreground">{t('needsPublishPermission')}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="when">{t('scheduledAt')}</Label>
              <Input
                id="when"
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => set('scheduled_at', e.target.value)}
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="link">{t('linkUrl')}</Label>
              <Input
                id="link"
                value={form.link_url}
                onChange={(e) => set('link_url', e.target.value)}
                placeholder="https://flow-agency-eg.com/pricing"
                disabled={!canEdit}
              />
            </div>

            {trackedLink && (
              <div className="space-y-1.5">
                <Label>{t('trackedLink')}</Label>
                <div className="flex gap-2">
                  <Input readOnly value={trackedLink} className="text-xs" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(trackedLink)
                      toast.success(tc('copied'))
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{t('trackedLinkHelp')}</p>
              </div>
            )}

            {post.error && (
              <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">{post.error}</p>
            )}

            {canEdit && (
              <Button onClick={save} disabled={saving} className="w-full">
                {saving ? tc('saving') : tc('save')}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('manualPublish')}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>{t('manualPublishHelp')}</p>
            <a
              href={PUBLISH_URL[post.platform]}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-foreground hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t(`openPlatform.${post.platform}`)}
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/** Where a person goes to post by hand until Phase 2 lands. */
const PUBLISH_URL = {
  instagram: 'https://business.facebook.com/latest/composer',
  facebook: 'https://business.facebook.com/latest/composer',
  linkedin: 'https://www.linkedin.com/company/',
} as const

/** `datetime-local` wants local wall-clock time, not an ISO string with a zone. */
function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
