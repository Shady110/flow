'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { PenLine } from 'lucide-react'
import { acceptContractAction } from '@/lib/db/contract-actions'
import { celebrate } from '@/components/portal/celebrate'
import { Button } from '@/components/ds/button'
import { Checkbox } from '@/components/ds/checkbox'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ds/sheet'

/**
 * Signing in two calm steps: a big button that is always on screen, then a
 * bottom sheet asking only for the full name and a tick. On a phone the button
 * floats above the tab bar so the client never has to hunt for it.
 */
export function AcceptContract({ contractId }: { contractId: string }) {
  const router = useRouter()
  const t = useTranslations('portal.contract')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [agree, setAgree] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="no-print fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 bg-gradient-to-t from-background via-background/95 to-transparent px-4 pb-3 pt-6 sm:static sm:bg-none sm:p-0">
        <SheetTrigger asChild>
          <Button size="lg" className="h-14 w-full text-base shadow-[var(--shadow-md)] sm:w-auto sm:px-10">
            <PenLine className="h-5 w-5" /> {t('signButton')}
          </Button>
        </SheetTrigger>
      </div>

      <SheetContent side="bottom" className="gap-0 rounded-t-3xl bg-card p-5 pb-8 sm:mx-auto sm:max-w-lg">
        <SheetTitle className="font-display text-2xl font-bold">{t('sheetTitle')}</SheetTitle>
        <p className="mt-1 text-base text-muted-foreground">{t('sheetHelp')}</p>
        <form
          className="mt-5 space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            startTransition(async () => {
              const res = await acceptContractAction({ contractId, name, agree })
              if (!res.ok) return void toast.error(res.error)
              setOpen(false)
              toast.success(t('thanks'))
              void celebrate()
              router.refresh()
            })
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="sign-name" className="text-base">{t('fullName')}</Label>
            <Input id="sign-name" autoComplete="name" className="h-14 text-base" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <label className="flex min-h-14 cursor-pointer items-center gap-4 rounded-2xl bg-muted/60 p-4 text-base">
            <Checkbox className="size-6 rounded-md" checked={agree} onCheckedChange={(v) => setAgree(!!v)} />
            <span>{t('agree')}</span>
          </label>
          <Button type="submit" size="lg" className="h-14 w-full text-base" disabled={pending || !agree || name.trim().length < 2}>
            {pending ? t('signing') : t('accept')}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
