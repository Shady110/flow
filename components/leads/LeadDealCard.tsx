'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { updateLeadDealAction } from '@/lib/db/lead-actions'
import { dealMonths, parseDeal } from '@/lib/deals'
import { MARKETPLACES } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import { Button } from '@/components/ds/button'
import { Checkbox } from '@/components/ds/checkbox'
import { DealEditor, dealToDraft, draftToDeal, type DealDraft } from '@/components/deals/DealEditor'

/**
 * What this lead wants: which marketplaces, how long, and which package for
 * which stretch of months. Becomes the client's deal when the lead converts.
 */
export function LeadDealCard({
  leadId,
  deal,
  canEdit,
}: {
  leadId: string
  deal: unknown
  canEdit: boolean
}) {
  const router = useRouter()
  const t = useTranslations('internal.leads')
  const tm = useTranslations('internal.marketplace')
  const saved = parseDeal(deal)
  const [platforms, setPlatforms] = useState<string[]>(saved?.platforms ?? [])
  const [draft, setDraft] = useState<DealDraft>(dealToDraft(saved))
  const [pending, startTransition] = useTransition()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('dealTitle')}</CardTitle>
        {saved ? (
          <p className="text-xs text-muted-foreground">{t('dealLength', { months: dealMonths(saved) })}</p>
        ) : (
          <p className="text-xs text-muted-foreground">{t('dealEmpty')}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {MARKETPLACES.map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm">
              <Checkbox
                disabled={!canEdit}
                checked={platforms.includes(m)}
                onCheckedChange={(on) =>
                  setPlatforms((ps) => (on ? [...ps, m] : ps.filter((x) => x !== m)))
                }
              />
              {tm(m)}
            </label>
          ))}
        </div>
        {canEdit ? (
          <>
            <DealEditor value={draft} onChange={setDraft} platforms={platforms} />
            <Button
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await updateLeadDealAction(leadId, draftToDeal(draft, platforms))
                  if (!res.ok) return void toast.error(res.error)
                  toast.success(t('dealSaved'))
                  router.refresh()
                })
              }
            >
              {t('saveDeal')}
            </Button>
          </>
        ) : (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {saved?.phases.map((p, i) => (
              <li key={i}>
                {p.plan} · {p.months} × {p.monthly}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
