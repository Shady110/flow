'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { updateLeadAction } from '@/lib/db/lead-actions'
import { LEAD_STATUSES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ds/select'
import type { Lead, LeadStatus } from '@/lib/types'

/**
 * Pipeline board. Drag a card to another column to advance it — native HTML5
 * drag and drop, no library. Every card also carries a status select, which is
 * the keyboard and touch path (HTML5 dnd doesn't fire on touch).
 */
export function LeadsBoard({
  leads,
  ownerNames,
  canEdit,
  capBlocked = false,
}: {
  leads: Lead[]
  ownerNames: Record<string, string>
  canEdit: boolean
  /** The monthly client cap is reached: nothing can be dropped on "won". */
  capBlocked?: boolean
}) {
  const router = useRouter()
  const t = useTranslations('internal.leads')
  const ts = useTranslations('internal.leadStatus')
  const tc = useTranslations('internal.common')
  const [, startTransition] = useTransition()
  const [dragging, setDragging] = useState<string | null>(null)
  const [over, setOver] = useState<LeadStatus | null>(null)
  // Optimistic column placement so the card moves the instant you drop it.
  const [moved, setMoved] = useState<Record<string, LeadStatus>>({})

  const statusOf = (lead: Lead) => moved[lead.id] ?? lead.status

  function move(leadId: string, status: LeadStatus) {
    const lead = leads.find((l) => l.id === leadId)
    if (!lead || statusOf(lead) === status) return
    if (capBlocked && status === 'won') {
      toast.error(t('capReached'))
      return
    }
    setMoved((m) => ({ ...m, [leadId]: status }))
    startTransition(async () => {
      const res = await updateLeadAction(leadId, { status })
      if (!res.ok) {
        setMoved((m) => {
          const next = { ...m }
          delete next[leadId]
          return next
        })
        toast.error(res.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {LEAD_STATUSES.map((status) => {
        const column = leads.filter((l) => statusOf(l) === status)
        return (
          <div
            key={status}
            onDragOver={(e) => {
              if (!canEdit) return
              e.preventDefault()
              setOver(status)
            }}
            onDragLeave={() => setOver((s) => (s === status ? null : s))}
            onDrop={(e) => {
              e.preventDefault()
              setOver(null)
              const id = e.dataTransfer.getData('text/plain') || dragging
              if (id) move(id, status)
              setDragging(null)
            }}
            className={cn(
              'flex w-64 shrink-0 flex-col rounded-xl border border-border bg-muted/30 p-3 transition-colors',
              over === status && 'border-flow-green bg-flow-lime/20',
            )}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{ts(status)}</p>
              <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                {column.length}
              </span>
            </div>

            <div className="space-y-2">
              {column.length === 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground">—</p>
              )}
              {column.map((lead) => (
                <div
                  key={lead.id}
                  draggable={canEdit}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', lead.id)
                    e.dataTransfer.effectAllowed = 'move'
                    setDragging(lead.id)
                  }}
                  onDragEnd={() => {
                    setDragging(null)
                    setOver(null)
                  }}
                  className={cn(
                    'space-y-2 rounded-lg border border-border bg-background p-3 shadow-[var(--shadow-sm)]',
                    canEdit && 'cursor-grab active:cursor-grabbing',
                    dragging === lead.id && 'opacity-50',
                  )}
                >
                  <Link href={`/leads/${lead.id}`} className="block text-sm font-medium hover:underline">
                    {lead.name}
                  </Link>
                  {lead.company && (
                    <p className="truncate text-xs text-muted-foreground">{lead.company}</p>
                  )}
                  <p className="truncate text-xs text-muted-foreground">
                    {[lead.area, lead.field].filter(Boolean).join(' · ') || '—'}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {lead.owner_id ? (ownerNames[lead.owner_id] ?? '—') : tc('unassigned')}
                  </p>
                  {canEdit && (
                    <Select value={statusOf(lead)} onValueChange={(v) => move(lead.id, v as LeadStatus)}>
                      <SelectTrigger className="h-7 w-full text-xs" aria-label={t('status')}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {ts(s)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
