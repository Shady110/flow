'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { movePlatformStageAction, moveClientStageAction } from '@/lib/db/flow-actions'
import { CLIENT_STAGES, PLATFORM_STAGES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { StageSelect } from '@/components/flow/StageSelect'
import type { ClientStage, Marketplace, PlatformStage } from '@/lib/types'

type Column = 'lead' | ClientStage | PlatformStage
const COLUMNS: Column[] = ['lead', 'group_created', 'paperwork', ...PLATFORM_STAGES]

export interface BoardClient { id: string; name: string; stage: ClientStage; platforms: Marketplace[] }
export interface BoardPlatform {
  id: string; client_id: string; client_name: string; platform: Marketplace
  stage: PlatformStage; stages: PlatformStage[]; am: string | null
}
export interface BoardLead { id: string; name: string; company: string | null; status: string }

type Card =
  | { kind: 'lead'; key: string; col: 'lead'; lead: BoardLead }
  | { kind: 'client'; key: string; col: ClientStage; client: BoardClient }
  | { kind: 'platform'; key: string; col: PlatformStage; p: BoardPlatform }

/**
 * The CEO's whole-company board. Leads sit in the first column (read-only —
 * Sales owns them); a client is one card while it is being onboarded, then
 * becomes one card per marketplace account moving through its own stages.
 * Drag to move; every card also has a select (keyboard + touch). The database
 * has the final say — a refused move comes back as a toast and snaps back.
 */
export function PipelineBoard({
  leads,
  clients,
  platforms,
}: {
  leads: BoardLead[]
  clients: BoardClient[]
  platforms: BoardPlatform[]
}) {
  const router = useRouter()
  const t = useTranslations('internal.flow')
  const tm = useTranslations('internal.marketplace')
  const [, startTransition] = useTransition()
  const [dragging, setDragging] = useState<string | null>(null)
  const [over, setOver] = useState<Column | null>(null)
  const [moved, setMoved] = useState<Record<string, Column>>({})

  const cards: Card[] = [
    ...leads.map((lead): Card => ({ kind: 'lead', key: `l:${lead.id}`, col: 'lead', lead })),
    ...clients
      .filter((c) => c.stage !== 'onboarded')
      .map((client): Card => ({ kind: 'client', key: `c:${client.id}`, col: client.stage as ClientStage, client })),
    ...platforms.map((p): Card => ({ kind: 'platform', key: `p:${p.id}`, col: p.stage, p })),
  ]
  const colOf = (c: Card) => moved[c.key] ?? c.col

  function move(key: string, to: Column) {
    const card = cards.find((c) => c.key === key)
    if (!card || colOf(card) === to) return
    let run: (() => Promise<{ ok: true } | { ok: false; error: string }>) | null = null
    if (card.kind === 'client' && (CLIENT_STAGES as string[]).includes(to)) {
      run = () => moveClientStageAction({ clientId: card.client.id, stage: to })
    } else if (card.kind === 'platform' && card.p.stages.includes(to as PlatformStage)) {
      run = () => movePlatformStageAction({ platformId: card.p.id, stage: to })
    }
    if (!run) {
      toast.error(t('cannotMoveThere'))
      return
    }
    setMoved((m) => ({ ...m, [key]: to }))
    startTransition(async () => {
      const res = await run!()
      if (!res.ok) {
        toast.error(res.error)
        setMoved((m) => {
          const next = { ...m }
          delete next[key]
          return next
        })
        return
      }
      router.refresh()
    })
  }

  const optionsFor = (card: Card) =>
    card.kind === 'client'
      ? CLIENT_STAGES.map((s) => ({ value: s as Column, label: t(`stage.${s}`) }))
      : card.kind === 'platform'
        ? card.p.stages.map((s) => ({ value: s as Column, label: t(`stage.${s}`) }))
        : []

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {COLUMNS.map((col) => {
        const column = cards.filter((c) => colOf(c) === col)
        return (
          <div
            key={col}
            onDragOver={(e) => {
              e.preventDefault()
              setOver(col)
            }}
            onDragLeave={() => setOver((s) => (s === col ? null : s))}
            onDrop={(e) => {
              e.preventDefault()
              setOver(null)
              const key = e.dataTransfer.getData('text/plain') || dragging
              if (key) move(key, col)
              setDragging(null)
            }}
            className={cn(
              'flex w-60 shrink-0 flex-col rounded-xl border border-border bg-muted/30 p-3 transition-colors',
              over === col && 'border-flow-green bg-flow-lime/20',
            )}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{t(col === 'lead' ? 'stage.lead' : `stage.${col}`)}</p>
              <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                {column.length}
              </span>
            </div>
            <div className="space-y-2">
              {column.length === 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground">—</p>
              )}
              {column.map((card) => (
                <div
                  key={card.key}
                  draggable={card.kind !== 'lead'}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', card.key)
                    e.dataTransfer.effectAllowed = 'move'
                    setDragging(card.key)
                  }}
                  onDragEnd={() => {
                    setDragging(null)
                    setOver(null)
                  }}
                  className={cn(
                    'space-y-2 rounded-lg border border-border bg-background p-3 shadow-[var(--shadow-sm)]',
                    card.kind !== 'lead' && 'cursor-grab active:cursor-grabbing',
                    dragging === card.key && 'opacity-50',
                  )}
                >
                  {card.kind === 'lead' && (
                    <>
                      <Link href={`/leads/${card.lead.id}`} className="block text-sm font-medium hover:underline">
                        {card.lead.name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {card.lead.company ?? '—'}
                      </p>
                    </>
                  )}
                  {card.kind === 'client' && (
                    <>
                      <Link href={`/clients/${card.client.id}`} className="block text-sm font-medium hover:underline">
                        {card.client.name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {card.client.platforms.length
                          ? card.client.platforms.map((m) => tm(m)).join(' · ')
                          : t('noPlatforms')}
                      </p>
                    </>
                  )}
                  {card.kind === 'platform' && (
                    <>
                      <Link href={`/clients/${card.p.client_id}`} className="block text-sm font-medium hover:underline">
                        {card.p.client_name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {tm(card.p.platform)} · {card.p.am ?? t('noManager')}
                      </p>
                    </>
                  )}
                  {card.kind !== 'lead' && (
                    <StageSelect
                      value={colOf(card)}
                      options={optionsFor(card)}
                      label={t('stageLabel')}
                      onChange={(v) => move(card.key, v)}
                    />
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
