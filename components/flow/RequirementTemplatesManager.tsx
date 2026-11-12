'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { deleteTemplateAction, saveTemplateAction } from '@/lib/db/requirement-actions'
import { MARKETPLACES, REQUIREMENT_KINDS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { Checkbox } from '@/components/ds/checkbox'
import { StageSelect } from '@/components/flow/StageSelect'
import type { RequirementKind, RequirementTemplate } from '@/lib/types'

interface DraftItem { label_en: string; label_ar: string; hint: string; required: boolean }
interface Draft { id: string | null; name: string; kind: RequirementKind; platform: string; items: DraftItem[] }

const blankItem = (): DraftItem => ({ label_en: '', label_ar: '', hint: '', required: true })
const blankDraft = (): Draft => ({ id: null, name: '', kind: 'client_document', platform: 'any', items: [blankItem()] })

export function RequirementTemplatesManager({ templates }: { templates: RequirementTemplate[] }) {
  const router = useRouter()
  const t = useTranslations('internal.requirements')
  const tm = useTranslations('internal.marketplace')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [pending, startTransition] = useTransition()

  const edit = (tpl: RequirementTemplate) =>
    setDraft({
      id: tpl.id,
      name: tpl.name,
      kind: tpl.kind,
      platform: tpl.platform ?? 'any',
      items: tpl.items.map((i) => ({
        label_en: i.label_en, label_ar: i.label_ar ?? '', hint: i.hint ?? '', required: i.required,
      })),
    })

  const setItem = (idx: number, patch: Partial<DraftItem>) =>
    setDraft((d) => d && { ...d, items: d.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) })

  function save() {
    if (!draft) return
    startTransition(async () => {
      const res = await saveTemplateAction(draft.id, {
        name: draft.name,
        kind: draft.kind,
        platform: draft.platform === 'any' ? null : draft.platform,
        items: draft.items
          .filter((i) => i.label_en.trim())
          .map((i) => ({
            label_en: i.label_en,
            label_ar: i.label_ar || null,
            hint: i.hint || null,
            required: i.required,
          })),
      })
      if (!res.ok) return void toast.error(res.error)
      toast.success(t('templateSaved'))
      setDraft(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {!draft && (
        <Button onClick={() => setDraft(blankDraft())}>
          <Plus className="h-4 w-4" /> {t('newTemplate')}
        </Button>
      )}

      {draft && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{draft.id ? t('editTemplate') : t('newTemplate')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="tpl-name">{t('templateName')}</Label>
                <Input id="tpl-name" value={draft.name} placeholder={t('templateNameHint')}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>{t('kindLabel')}</Label>
                <StageSelect value={draft.kind} label={t('kindLabel')}
                  options={REQUIREMENT_KINDS.map((k) => ({ value: k, label: t(`kind.${k}`) }))}
                  onChange={(kind) => setDraft({ ...draft, kind })} />
              </div>
              <div className="space-y-1">
                <Label>{t('platform')}</Label>
                <StageSelect value={draft.platform} label={t('platform')}
                  options={[{ value: 'any', label: t('anyPlatform') }, ...MARKETPLACES.map((m) => ({ value: m as string, label: tm(m) }))]}
                  onChange={(platform) => setDraft({ ...draft, platform })} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t('items')}</p>
              {draft.items.map((it, idx) => (
                <div key={idx} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_1fr_1fr_auto_auto]">
                  <Input aria-label={t('itemEn')} placeholder={t('itemEn')} value={it.label_en}
                    onChange={(e) => setItem(idx, { label_en: e.target.value })} />
                  <Input aria-label={t('itemAr')} placeholder={t('itemAr')} dir="rtl" value={it.label_ar}
                    onChange={(e) => setItem(idx, { label_ar: e.target.value })} />
                  <Input aria-label={t('hint')} placeholder={t('hint')} value={it.hint}
                    onChange={(e) => setItem(idx, { hint: e.target.value })} />
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={it.required} onCheckedChange={(v) => setItem(idx, { required: !!v })} />
                    {t('requiredLabel')}
                  </label>
                  <Button type="button" size="sm" variant="ghost" className="text-destructive"
                    aria-label={t('delete')}
                    disabled={draft.items.length === 1}
                    onClick={() => setDraft({ ...draft, items: draft.items.filter((_, i) => i !== idx) })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" size="sm" variant="outline"
                onClick={() => setDraft({ ...draft, items: [...draft.items, blankItem()] })}>
                <Plus className="h-4 w-4" /> {t('addRow')}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={save} disabled={pending}>{t('save')}</Button>
              <Button variant="ghost" onClick={() => setDraft(null)}>{t('cancel')}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {templates.length === 0 && !draft && (
        <p className="text-sm text-muted-foreground">{t('noTemplates')}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((tpl) => (
          <Card key={tpl.id}>
            <CardHeader>
              <CardTitle className="text-base">{tpl.name}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {t(`kind.${tpl.kind}`)}{tpl.platform ? ` · ${tm(tpl.platform)}` : ''}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc space-y-1 ps-5 text-sm">
                {tpl.items.map((i) => (
                  <li key={i.id}>
                    {i.label_en}
                    {!i.required && <span className="text-muted-foreground"> ({t('optional')})</span>}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => edit(tpl)}>{t('edit')}</Button>
                <Button size="sm" variant="ghost" className="text-destructive" disabled={pending}
                  onClick={() => {
                    if (!confirm(t('confirmDelete', { name: tpl.name }))) return
                    startTransition(async () => {
                      const res = await deleteTemplateAction(tpl.id)
                      if (!res.ok) toast.error(res.error)
                      else router.refresh()
                    })
                  }}>
                  {t('delete')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
