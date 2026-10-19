'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { deleteContractTemplateAction, saveContractTemplateAction } from '@/lib/db/contract-actions'
import { PLACEHOLDERS } from '@/lib/contracts'
import { STARTER_CONTRACT } from '@/lib/contract-starter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { Textarea } from '@/components/ds/textarea'
import { StageSelect } from '@/components/flow/StageSelect'
import type { ContractTemplate } from '@/lib/types'

interface Draft { id: string | null; name: string; locale: 'en' | 'ar'; body: string }

export function ContractTemplatesManager({ templates }: { templates: ContractTemplate[] }) {
  const router = useRouter()
  const t = useTranslations('internal.contracts')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [pending, startTransition] = useTransition()

  const starter = (locale: 'en' | 'ar'): Draft => ({ id: null, locale, ...STARTER_CONTRACT[locale] })

  return (
    <div className="space-y-6">
      {!draft && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setDraft(starter('en'))}>
            <Plus className="h-4 w-4" /> {t('starterEn')}
          </Button>
          <Button variant="outline" onClick={() => setDraft(starter('ar'))}>
            <Plus className="h-4 w-4" /> {t('starterAr')}
          </Button>
          <Button variant="ghost" onClick={() => setDraft({ id: null, name: '', locale: 'en', body: '' })}>
            {t('blankTemplate')}
          </Button>
        </div>
      )}

      {draft && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{draft.id ? t('editTemplate') : t('newTemplate')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="ct-name">{t('templateName')}</Label>
                <Input id="ct-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>{t('language')}</Label>
                <StageSelect value={draft.locale} label={t('language')}
                  options={[{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }]}
                  onChange={(locale) => setDraft({ ...draft, locale })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ct-body">{t('text')}</Label>
              <Textarea id="ct-body" rows={22} dir={draft.locale === 'ar' ? 'rtl' : 'ltr'} value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
              <p className="text-xs text-muted-foreground">
                {t('placeholders')}{' '}
                {PLACEHOLDERS.map((p) => (
                  <code key={p} className="me-1 rounded bg-muted px-1">{`{{${p}}}`}</code>
                ))}
              </p>
              <p className="text-xs text-muted-foreground">{t('legalNote')}</p>
            </div>
            <div className="flex gap-2">
              <Button disabled={pending} onClick={() =>
                startTransition(async () => {
                  const res = await saveContractTemplateAction(draft.id, {
                    name: draft.name, locale: draft.locale, body: draft.body,
                  })
                  if (!res.ok) return void toast.error(res.error)
                  toast.success(t('templateSaved'))
                  setDraft(null)
                  router.refresh()
                })}>
                {t('save')}
              </Button>
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
              <p className="text-xs text-muted-foreground">{tpl.locale === 'ar' ? 'العربية' : 'English'}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="line-clamp-3 text-sm text-muted-foreground" dir={tpl.locale === 'ar' ? 'rtl' : 'ltr'}>
                {tpl.body}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline"
                  onClick={() => setDraft({ id: tpl.id, name: tpl.name, locale: tpl.locale, body: tpl.body })}>
                  {t('edit')}
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" disabled={pending}
                  onClick={() => {
                    if (!confirm(t('confirmDeleteTemplate', { name: tpl.name }))) return
                    startTransition(async () => {
                      const res = await deleteContractTemplateAction(tpl.id)
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
