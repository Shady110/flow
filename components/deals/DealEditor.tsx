'use client'

import { useTranslations } from 'next-intl'
import { Plus, Trash2 } from 'lucide-react'
import { ACCOUNT_PLANS } from '@/lib/pricing/quote'
import { dealTotal, parseDeal } from '@/lib/deals'
import { formatMoney } from '@/lib/money'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'

export interface DealPhaseDraft { plan: string; months: string; monthly: string }
export interface DealDraft { phases: DealPhaseDraft[]; oneTime: string }

/** Turn the editor's text fields into the numbers the deal helpers expect. */
export function draftToDeal(draft: DealDraft, platforms: string[]) {
  return {
    platforms,
    phases: draft.phases.map((p) => ({ plan: p.plan.trim(), months: Number(p.months), monthly: Number(p.monthly) })),
    ...(Number(draft.oneTime) > 0 ? { one_time: Number(draft.oneTime) } : {}),
  }
}

export function dealToDraft(deal: { phases: { plan: string; months: number; monthly: number }[]; one_time?: number } | null): DealDraft {
  return {
    phases: (deal?.phases ?? [{ plan: 'Basic', months: 6, monthly: 2500 }]).map((p) => ({
      plan: p.plan, months: String(p.months), monthly: String(p.monthly),
    })),
    oneTime: deal?.one_time ? String(deal.one_time) : '',
  }
}

/**
 * Package phases for a contract: "3 months on Basic, then 3 on Premium".
 * Used by the sales deal card and the contract composer.
 */
export function DealEditor({
  value,
  onChange,
  platforms,
}: {
  value: DealDraft
  onChange: (next: DealDraft) => void
  platforms: string[]
}) {
  const t = useTranslations('internal.contracts')
  const setPhase = (i: number, patch: Partial<DealPhaseDraft>) =>
    onChange({ ...value, phases: value.phases.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) })
  const total = parseDeal(draftToDeal(value, platforms))

  return (
    <div className="space-y-3">
      {value.phases.map((p, i) => (
        <div key={i} className="grid grid-cols-[1fr_4.5rem_6.5rem_auto] items-end gap-2">
          <div className="space-y-1">
            {i === 0 && <Label className="text-xs">{t('plan')}</Label>}
            <Input value={p.plan} onChange={(e) => setPhase(i, { plan: e.target.value })} />
          </div>
          <div className="space-y-1">
            {i === 0 && <Label className="text-xs">{t('months')}</Label>}
            <Input type="number" min="1" inputMode="numeric" value={p.months} onChange={(e) => setPhase(i, { months: e.target.value })} />
          </div>
          <div className="space-y-1">
            {i === 0 && <Label className="text-xs">{t('perMonth')}</Label>}
            <Input type="number" min="0" inputMode="decimal" value={p.monthly} onChange={(e) => setPhase(i, { monthly: e.target.value })} />
          </div>
          <Button type="button" size="sm" variant="ghost" className="text-destructive" aria-label={t('delete')}
            disabled={value.phases.length === 1}
            onClick={() => onChange({ ...value, phases: value.phases.filter((_, idx) => idx !== i) })}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="flex flex-wrap items-end gap-2">
        {ACCOUNT_PLANS.map((plan) => (
          <Button key={plan.name} type="button" size="sm" variant="outline"
            onClick={() => onChange({ ...value, phases: [...value.phases, { plan: plan.name, months: '3', monthly: String(plan.monthly) }] })}>
            <Plus className="h-4 w-4" /> {plan.name}
          </Button>
        ))}
        <Button type="button" size="sm" variant="outline"
          onClick={() => onChange({ ...value, phases: [...value.phases, { plan: '', months: '3', monthly: '' }] })}>
          <Plus className="h-4 w-4" /> {t('addPhase')}
        </Button>
        <div className="space-y-1">
          <Label className="text-xs">{t('oneTime')}</Label>
          <Input className="w-28" type="number" min="0" inputMode="decimal" value={value.oneTime}
            onChange={(e) => onChange({ ...value, oneTime: e.target.value })} />
        </div>
      </div>
      <p className="text-sm font-medium">
        {total ? t('totalLine', { total: formatMoney(dealTotal(total)) }) : t('termsIncomplete')}
      </p>
    </div>
  )
}
