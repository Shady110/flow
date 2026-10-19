'use client'

import { SidebarNav } from './SidebarNav'
import { CapCard } from './CapCard'
import { Brand } from './Brand'
import type { PermissionKey } from '@/lib/types'

/** Floating desktop sidebar. Below `lg` the same menu lives in the Topbar's drawer. */
export function Sidebar({
  permissions,
  cap,
}: {
  permissions: PermissionKey[]
  /** Shown to anyone who can see leads. */
  cap?: { won: number; cap: number } | null
}) {
  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 flex-col rounded-3xl bg-card p-4 shadow-[var(--shadow-sm)] lg:flex">
      <div className="px-2 pb-2 pt-1">
        <Brand />
      </div>
      <div className="-mx-1 flex-1 overflow-y-auto px-1 pb-4">
        <SidebarNav permissions={permissions} />
      </div>
      {cap && <CapCard won={cap.won} cap={cap.cap} />}
    </aside>
  )
}
