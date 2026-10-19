'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ds/sheet'
import { SidebarNav } from './SidebarNav'
import { Brand } from './Brand'
import type { PermissionKey } from '@/lib/types'

/** Hamburger + drawer with the full menu, for screens too narrow for the sidebar. */
export function MobileNav({ permissions }: { permissions: PermissionKey[] }) {
  const [open, setOpen] = useState(false)
  const t = useTranslations('internal.shell')
  // The drawer opens from the reading-start edge.
  const side = useLocale() === 'ar' ? 'right' : 'left'
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={t('openMenu')}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side={side} className="w-72 gap-0 bg-card p-4" showCloseButton={false}>
        <SheetTitle className="sr-only">{t('openMenu')}</SheetTitle>
        <div className="px-2 pb-2 pt-1">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav permissions={permissions} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
