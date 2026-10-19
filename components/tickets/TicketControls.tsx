'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { updateTicketAction } from '@/lib/db/ticket-actions'
import { TICKET_PRIORITIES, TICKET_STATUSES } from '@/lib/tickets'
import { Label } from '@/components/ds/label'
import { StageSelect } from '@/components/flow/StageSelect'
import type { Ticket } from '@/lib/types'

/** Staff controls on a ticket: status, priority, who is handling it. */
export function TicketControls({
  ticket,
  team,
}: {
  ticket: Pick<Ticket, 'id' | 'status' | 'priority' | 'assignee_id'>
  team: { id: string; label: string }[]
}) {
  const router = useRouter()
  const t = useTranslations('internal.tickets')
  const [pending, startTransition] = useTransition()

  const save = (fields: Record<string, unknown>) =>
    startTransition(async () => {
      const res = await updateTicketAction({ ticketId: ticket.id, ...fields })
      if (!res.ok) return void toast.error(res.error)
      router.refresh()
    })

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="space-y-1">
        <Label className="text-xs">{t('status')}</Label>
        <StageSelect value={ticket.status} label={t('status')} disabled={pending}
          options={TICKET_STATUSES.map((s) => ({ value: s as string, label: t(`statuses.${s}`) }))}
          onChange={(status) => save({ status })} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t('priority')}</Label>
        <StageSelect value={ticket.priority} label={t('priority')} disabled={pending}
          options={TICKET_PRIORITIES.map((p) => ({ value: p as string, label: t(`priorities.${p}`) }))}
          onChange={(priority) => save({ priority })} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t('assignee')}</Label>
        <StageSelect value={ticket.assignee_id ?? 'none'} label={t('assignee')} disabled={pending}
          options={[{ value: 'none', label: '—' }, ...team.map((m) => ({ value: m.id, label: m.label }))]}
          onChange={(v) => save({ assignee_id: v === 'none' ? null : v })} />
      </div>
    </div>
  )
}
