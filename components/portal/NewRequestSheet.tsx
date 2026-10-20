'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  BadgeCheck, ClipboardCheck, FileWarning, HelpCircle, Megaphone, PackagePlus, Plus, ShieldCheck, Tags, type LucideIcon,
} from 'lucide-react'
import { createTicketAction } from '@/lib/db/ticket-actions'
import { TICKET_CATEGORIES } from '@/lib/tickets'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ds/button'
import { Textarea } from '@/components/ds/textarea'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ds/sheet'
import type { Marketplace } from '@/lib/types'

const ICON: Record<string, LucideIcon> = {
  listing_issue: FileWarning,
  account_health: ShieldCheck,
  brand_registry: BadgeCheck,
  catalog_qc: ClipboardCheck,
  price_stock: Tags,
  new_products: PackagePlus,
  ads: Megaphone,
  other: HelpCircle,
}

export interface RequestPlatform { id: string; platform: Marketplace; label: string }

/**
 * "Ask us for something" for a client: pick what it is about from big cards,
 * say it in your own words, send. No titles, no dropdowns, no jargon.
 */
export function NewRequestSheet({ platforms }: { platforms: RequestPlatform[] }) {
  const router = useRouter()
  const t = useTranslations('portal.requests')
  const tc = useTranslations('internal.tickets')
  const [open, setOpen] = useState(false)
  const [platformId, setPlatformId] = useState(platforms[0]?.id ?? '')
  const [category, setCategory] = useState('')
  const [body, setBody] = useState('')
  const [pending, startTransition] = useTransition()

  const platform = platforms.find((p) => p.id === platformId)
  const categories = platform ? TICKET_CATEGORIES[platform.platform] : []

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="lg" className="h-14 w-full text-base sm:w-auto sm:px-10">
          <Plus className="h-5 w-5" /> {t('newRequest')}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[92dvh] gap-0 overflow-y-auto rounded-t-3xl bg-card p-5 pb-8 sm:mx-auto sm:max-w-xl">
        <SheetTitle className="font-display text-2xl font-bold">{t('sheetTitle')}</SheetTitle>

        {platforms.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label={t('whichAccount')}>
            {platforms.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={p.id === platformId}
                onClick={() => { setPlatformId(p.id); setCategory('') }}
                className={cn('min-h-11 rounded-full border px-5 text-base font-medium', p.id === platformId ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card')}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        <p className="mt-5 text-base font-medium">{t('whatAbout')}</p>
        <div className="mt-3 grid grid-cols-2 gap-3" role="radiogroup" aria-label={t('whatAbout')}>
          {categories.map((c) => {
            const Icon = ICON[c] ?? HelpCircle
            const on = c === category
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setCategory(c)}
                className={cn(
                  'flex min-h-24 flex-col items-start justify-between gap-2 rounded-2xl border p-3 text-start transition-colors',
                  on ? 'border-primary bg-[var(--brand)]/10' : 'border-border bg-card hover:bg-muted/50',
                )}
              >
                <Icon className="h-6 w-6 text-[var(--brand-ink)]" />
                <span className="text-sm font-semibold leading-snug">{tc(`categories.${c}`)}</span>
              </button>
            )
          })}
        </div>

        <label htmlFor="req-body" className="mt-5 block text-base font-medium">{t('tellUs')}</label>
        <Textarea id="req-body" rows={4} className="mt-2 min-h-28 text-base" placeholder={t('tellUsHint')} value={body} onChange={(e) => setBody(e.target.value)} />

        <Button
          size="lg"
          className="mt-5 h-14 w-full text-base"
          disabled={pending || !category || body.trim().length < 3}
          onClick={() =>
            startTransition(async () => {
              const res = await createTicketAction({ platformId, category, title: tc(`categories.${category}`), body })
              if (!res.ok) return void toast.error(res.error)
              toast.success(t('sent'))
              setOpen(false)
              setCategory('')
              setBody('')
              router.push(`/tickets/${res.id}`)
              router.refresh()
            })
          }
        >
          {t('send')}
        </Button>
        {(!category || body.trim().length < 3) && <p className="mt-2 text-center text-sm text-muted-foreground">{t('fillBoth')}</p>}
      </SheetContent>
    </Sheet>
  )
}
