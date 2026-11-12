'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Rocket } from 'lucide-react'
import { movePlatformStageAction } from '@/lib/db/flow-actions'
import { Button } from '@/components/ds/button'
import type { PlatformStage } from '@/lib/types'

/**
 * Moves the account on from Content. Disabled while required deliverables are
 * missing — and the database refuses the move anyway, so this is just clarity.
 * On success the account leaves Content's view, so we go back to the queue.
 */
export function PushToPlatformButton({
  platformId,
  next,
  missing,
}: {
  platformId: string
  next: PlatformStage
  missing: number
}) {
  const router = useRouter()
  const t = useTranslations('internal.content')
  const [pending, startTransition] = useTransition()

  return (
    <div className="space-y-2">
      <Button
        disabled={pending || missing > 0}
        onClick={() => {
          if (!confirm(t('confirmPush'))) return
          startTransition(async () => {
            const res = await movePlatformStageAction({ platformId, stage: next })
            if (!res.ok) return void toast.error(res.error)
            toast.success(t('pushed'))
            router.push('/content')
            router.refresh()
          })
        }}
      >
        <Rocket className="h-4 w-4" /> {t('push')}
      </Button>
      {missing > 0 && <p className="text-sm text-muted-foreground">{t('missingBlock', { count: missing })}</p>}
    </div>
  )
}
