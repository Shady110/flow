'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useFormatter } from 'next-intl'
import { toast } from 'sonner'
import {
  addPlatformAction,
  moveClientStageAction,
  movePlatformStageAction,
  removePlatformAction,
  setClientAssignmentsAction,
  updateClientFlowAction,
  updatePlatformSetupAction,
} from '@/lib/db/flow-actions'
import { CLIENT_STAGES, MARKETPLACES, PLATFORM_STAGES } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { Checkbox } from '@/components/ds/checkbox'
import { StageSelect } from '@/components/flow/StageSelect'
import { Stepper } from '@/components/flow/Stepper'
import type { Client, ClientPlatform, Marketplace, PlatformStage, StageEvent } from '@/lib/types'

/**
 * The CEO's control panel for one client: onboarding stage, money, and every
 * marketplace account with its own stages and account manager.
 * Non-CEO viewers (content / accounts) get the read-only stepper.
 */
export function ClientFlowCard({
  client,
  platforms,
  events,
  team,
  people,
  assignedIds,
  canAssign,
  canManage,
}: {
  client: Pick<Client, 'id' | 'stage' | 'budget' | 'estimated_cost' | 'target_live_date'>
  platforms: ClientPlatform[]
  events: StageEvent[]
  /** Account-management people who can be assigned to this client. */
  team: { id: string; label: string }[]
  /** Everyone, to name who made each stage change. */
  people: { id: string; label: string }[]
  assignedIds: string[]
  canAssign: boolean
  canManage: boolean
}) {
  const router = useRouter()
  const t = useTranslations('internal.flow')
  const tm = useTranslations('internal.marketplace')
  const format = useFormatter()
  const [pending, startTransition] = useTransition()

  const [budget, setBudget] = useState(client.budget?.toString() ?? '')
  const [estimate, setEstimate] = useState(client.estimated_cost?.toString() ?? '')
  const [target, setTarget] = useState(client.target_live_date ?? '')
  const [adding, setAdding] = useState<Marketplace | ''>('')
  // Per-platform pending edits to the "which stages apply" checkboxes + AM.
  const [setup, setSetup] = useState<Record<string, { stages: PlatformStage[] }>>({})
  const [assigned, setAssigned] = useState<string[]>(assignedIds)

  const stageLabel = (s: string) => t(`stage.${s}`)
  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>, ok?: string) =>
    startTransition(async () => {
      const res = await fn()
      if (!res.ok) return void toast.error(res.error)
      if (ok) toast.success(ok)
      router.refresh()
    })

  const availableToAdd = MARKETPLACES.filter((m) => !platforms.some((p) => p.platform === m))
  const nameOf = (id: string | null) => people.find((m) => m.id === id)?.label ?? '—'
  const assignedNames = assignedIds.map((id) => team.find((m) => m.id === id)?.label).filter(Boolean).join(', ') || '—'
  const assignmentDirty = [...assigned].sort().join() !== [...assignedIds].sort().join()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('flowTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Onboarding */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{t('onboarding')}</p>
          <Stepper
            steps={CLIENT_STAGES.map((s) => ({ id: s, label: stageLabel(s) }))}
            current={client.stage}
          />
          {canManage && (
            <div className="max-w-48">
              <StageSelect
                value={client.stage}
                label={t('stageLabel')}
                options={CLIENT_STAGES.map((s) => ({ value: s, label: stageLabel(s) }))}
                disabled={pending}
                onChange={(stage) => run(() => moveClientStageAction({ clientId: client.id, stage }))}
              />
            </div>
          )}
        </div>

        {/* Money */}
        {canManage && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="flow-budget">{t('budget')}</Label>
              <Input id="flow-budget" type="number" min="0" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="flow-est">{t('estimatedCost')}</Label>
              <Input id="flow-est" type="number" min="0" inputMode="decimal" value={estimate} onChange={(e) => setEstimate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="flow-target">{t('targetLive')}</Label>
              <Input id="flow-target" type="date" value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
            <div className="sm:col-span-3">
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  run(
                    () =>
                      updateClientFlowAction({
                        clientId: client.id,
                        budget: budget === '' ? null : Number(budget),
                        estimated_cost: estimate === '' ? null : Number(estimate),
                        target_live_date: target || null,
                      }),
                    t('saved'),
                  )
                }
              >
                {t('save')}
              </Button>
            </div>
          </div>
        )}

        {/* Who works this client (per client, all marketplaces) */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{t('assignedTo')}</p>
          {canAssign ? (
            <>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {team.length === 0 && <p className="text-sm text-muted-foreground">{t('noAccountManagers')}</p>}
                {team.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={assigned.includes(m.id)}
                      onCheckedChange={(on) =>
                        setAssigned((list) => (on ? [...list, m.id] : list.filter((id) => id !== m.id)))
                      }
                    />
                    {m.label}
                  </label>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={pending || !assignmentDirty}
                onClick={() => run(() => setClientAssignmentsAction({ clientId: client.id, profileIds: assigned }), t('saved'))}
              >
                {t('save')}
              </Button>
            </>
          ) : (
            <p className="text-sm">{assignedNames}</p>
          )}
        </div>

        {/* Platform accounts */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">{t('platforms')}</p>
          {platforms.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('noPlatformsYet')}</p>
          )}
          {platforms.map((p) => {
            const edit = setup[p.id] ?? { stages: p.stages }
            const dirty = edit.stages.join() !== p.stages.join()
            return (
              <div key={p.id} className="space-y-3 rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{tm(p.platform)}</p>
                </div>
                <Stepper
                  steps={p.stages.map((s) => ({ id: s, label: stageLabel(s) }))}
                  current={p.stage}
                />
                {canManage && (
                  <>
                    <div className="max-w-48">
                      <StageSelect
                        value={p.stage}
                        label={t('stageLabel')}
                        options={p.stages.map((s) => ({ value: s, label: stageLabel(s) }))}
                        disabled={pending}
                        onChange={(stage) => run(() => movePlatformStageAction({ platformId: p.id, stage }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">{t('appliesStages')}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {PLATFORM_STAGES.map((s) => (
                          <label key={s} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={edit.stages.includes(s)}
                              onCheckedChange={(on) =>
                                setSetup((m) => ({
                                  ...m,
                                  [p.id]: {
                                    ...edit,
                                    stages: PLATFORM_STAGES.filter((x) =>
                                      x === s ? !!on : edit.stages.includes(x),
                                    ),
                                  },
                                }))
                              }
                            />
                            {stageLabel(s)}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending || !dirty}
                        onClick={() =>
                          run(
                            () =>
                              updatePlatformSetupAction({
                                platformId: p.id,
                                clientId: client.id,
                                stages: edit.stages,
                              }),
                            t('saved'),
                          )
                        }
                      >
                        {t('save')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        disabled={pending}
                        onClick={() => {
                          if (confirm(t('removeConfirm', { platform: tm(p.platform) })))
                            run(() => removePlatformAction(p.id, client.id))
                        }}
                      >
                        {t('remove')}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )
          })}

          {canManage && availableToAdd.length > 0 && (
            <div className="flex max-w-xs items-center gap-2">
              <StageSelect
                value={adding || 'pick'}
                label={t('addPlatform')}
                options={[
                  { value: 'pick', label: t('addPlatform') },
                  ...availableToAdd.map((m) => ({ value: m as string, label: tm(m) })),
                ]}
                onChange={(v) => setAdding(v === 'pick' ? '' : (v as Marketplace))}
              />
              <Button
                size="sm"
                disabled={pending || !adding}
                onClick={() => {
                  run(() => addPlatformAction({ clientId: client.id, platform: adding }))
                  setAdding('')
                }}
              >
                {t('add')}
              </Button>
            </div>
          )}
        </div>

        {/* History */}
        {events.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{t('history')}</p>
            <ul className="space-y-1 text-sm">
              {events.map((e) => {
                const p = platforms.find((x) => x.id === e.platform_id)
                return (
                  <li key={e.id} className="flex flex-wrap gap-x-2 text-muted-foreground">
                    <span className="text-foreground">
                      {p ? `${tm(p.platform)} · ` : ''}
                      {e.from_stage ? `${stageLabel(e.from_stage)} → ` : ''}
                      {stageLabel(e.to_stage)}
                    </span>
                    <span>
                      {nameOf(e.actor_id)} ·{' '}
                      {format.dateTime(new Date(e.created_at), { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
