'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Check, Trash2, X } from 'lucide-react'
import {
  addRequirementAction,
  applyTemplateAction,
  deleteRequirementAction,
  reviewRequirementAction,
} from '@/lib/db/requirement-actions'
import { REQUIREMENT_KINDS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Checkbox } from '@/components/ds/checkbox'
import { StageSelect } from '@/components/flow/StageSelect'
import { RequirementUpload } from '@/components/flow/RequirementUpload'
import { RequirementStatusBadge, ViewFileButton } from '@/components/flow/RequirementBits'
import type {
  ClientPlatform,
  ClientRequirement,
  RequirementKind,
  RequirementTemplate,
} from '@/lib/types'

/**
 * Staff view of what a client (documents) or Content (deliverables) still owes.
 * `canManage` = CEO: apply templates, approve / reject / waive, add or delete items.
 */
export function ClientRequirementsCard({
  clientId,
  requirements,
  platforms,
  templates,
  canManage,
}: {
  clientId: string
  requirements: ClientRequirement[]
  platforms: Pick<ClientPlatform, 'id' | 'platform'>[]
  templates: Pick<RequirementTemplate, 'id' | 'name' | 'kind' | 'platform'>[]
  canManage: boolean
}) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('internal.requirements')
  const tm = useTranslations('internal.marketplace')
  const [pending, startTransition] = useTransition()

  const [templateId, setTemplateId] = useState('none')
  const [applyPlatform, setApplyPlatform] = useState('auto')
  const [newKind, setNewKind] = useState<RequirementKind>('client_document')
  const [newLabel, setNewLabel] = useState('')
  const [newPlatform, setNewPlatform] = useState('none')
  const [newRequired, setNewRequired] = useState(true)

  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>, ok?: string) =>
    startTransition(async () => {
      const res = await fn()
      if (!res.ok) return void toast.error(res.error)
      if (ok) toast.success(ok)
      router.refresh()
    })

  const label = (r: ClientRequirement) => (locale === 'ar' && r.label_ar ? r.label_ar : r.label_en)
  const platformName = (id: string | null) => {
    const p = platforms.find((x) => x.id === id)
    return p ? tm(p.platform) : null
  }
  const chosen = templates.find((x) => x.id === templateId)

  if (!canManage && requirements.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {canManage && (
          <div className="flex flex-wrap items-end gap-2">
            <div className="w-56">
              <StageSelect
                value={templateId}
                label={t('pickTemplate')}
                options={[
                  { value: 'none', label: t('pickTemplate') },
                  ...templates.map((x) => ({ value: x.id, label: `${x.name} · ${t(`kind.${x.kind}`)}` })),
                ]}
                onChange={setTemplateId}
              />
            </div>
            {chosen?.kind === 'content_deliverable' && (
              <div className="w-40">
                <StageSelect
                  value={applyPlatform}
                  label={t('platform')}
                  options={[
                    { value: 'auto', label: t('autoPlatform') },
                    ...platforms.map((p) => ({ value: p.id, label: tm(p.platform) })),
                  ]}
                  onChange={setApplyPlatform}
                />
              </div>
            )}
            <Button
              size="sm"
              disabled={pending || templateId === 'none'}
              onClick={() =>
                run(
                  () =>
                    applyTemplateAction({
                      clientId,
                      templateId,
                      platformId: applyPlatform === 'auto' ? null : applyPlatform,
                    }),
                  t('applied'),
                )
              }
            >
              {t('apply')}
            </Button>
          </div>
        )}

        {requirements.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        )}

        {REQUIREMENT_KINDS.map((kind) => {
          const rows = requirements.filter((r) => r.kind === kind)
          if (rows.length === 0) return null
          return (
            <div key={kind} className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t(`kind.${kind}`)}</p>
              <ul className="divide-y divide-border rounded-lg border border-border">
                {rows.map((r) => (
                  <li key={r.id} className="space-y-2 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{label(r)}</span>
                      {!r.required && (
                        <span className="text-xs text-muted-foreground">{t('optional')}</span>
                      )}
                      {platformName(r.platform_id) && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          {platformName(r.platform_id)}
                        </span>
                      )}
                      <RequirementStatusBadge status={r.status} label={t(`status.${r.status}`)} />
                    </div>
                    {r.status === 'rejected' && r.note && (
                      <p className="text-xs text-destructive">{r.note}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-1">
                      {r.file_path && <ViewFileButton requirementId={r.id} label={r.file_name ?? t('view')} />}
                      {canManage && r.status !== 'approved' && r.status !== 'waived' && (
                        <RequirementUpload
                          requirementId={r.id}
                          label={r.file_path ? t('replace') : t('upload')}
                        />
                      )}
                      {canManage && r.status === 'submitted' && (
                        <>
                          <Button size="sm" variant="ghost" disabled={pending}
                            onClick={() => run(() => reviewRequirementAction({ id: r.id, clientId, status: 'approved', note: null }))}>
                            <Check className="h-4 w-4" /> {t('approve')}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" disabled={pending}
                            onClick={() => {
                              const note = window.prompt(t('rejectReason'))
                              if (note === null) return
                              run(() => reviewRequirementAction({ id: r.id, clientId, status: 'rejected', note: note || null }))
                            }}>
                            <X className="h-4 w-4" /> {t('reject')}
                          </Button>
                        </>
                      )}
                      {canManage && (r.status === 'pending' || r.status === 'rejected') && (
                        <Button size="sm" variant="ghost" disabled={pending}
                          onClick={() => run(() => reviewRequirementAction({ id: r.id, clientId, status: 'waived', note: null }))}>
                          {t('waive')}
                        </Button>
                      )}
                      {canManage && (r.status === 'approved' || r.status === 'waived') && (
                        <Button size="sm" variant="ghost" disabled={pending}
                          onClick={() => run(() => reviewRequirementAction({ id: r.id, clientId, status: 'pending', note: null }))}>
                          {t('reopen')}
                        </Button>
                      )}
                      {canManage && (
                        <Button size="sm" variant="ghost" className="ms-auto text-destructive" disabled={pending}
                          aria-label={t('delete')}
                          onClick={() => run(() => deleteRequirementAction(r.id, clientId))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}

        {canManage && (
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground">{t('addItem')}</p>
            <div className="flex flex-wrap items-end gap-2">
              <div className="w-44">
                <StageSelect
                  value={newKind}
                  label={t('kindLabel')}
                  options={REQUIREMENT_KINDS.map((k) => ({ value: k, label: t(`kind.${k}`) }))}
                  onChange={setNewKind}
                />
              </div>
              {newKind === 'content_deliverable' && (
                <div className="w-36">
                  <StageSelect
                    value={newPlatform}
                    label={t('platform')}
                    options={[
                      { value: 'none', label: t('platform') },
                      ...platforms.map((p) => ({ value: p.id, label: tm(p.platform) })),
                    ]}
                    onChange={setNewPlatform}
                  />
                </div>
              )}
              <Input className="h-8 w-56" placeholder={t('itemName')} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={newRequired} onCheckedChange={(v) => setNewRequired(!!v)} />
                {t('requiredLabel')}
              </label>
              <Button size="sm" variant="outline" disabled={pending || !newLabel.trim()}
                onClick={() => {
                  run(() => addRequirementAction({
                    clientId,
                    platformId: newKind === 'content_deliverable' && newPlatform !== 'none' ? newPlatform : null,
                    kind: newKind,
                    label_en: newLabel,
                    label_ar: null,
                    required: newRequired,
                  }))
                  setNewLabel('')
                }}>
                {t('add')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
