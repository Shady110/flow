import { LayoutDashboard, ClipboardCheck, MessageCircle, LifeBuoy, Wallet, type LucideIcon } from 'lucide-react'

export interface PortalTab {
  /** Key under `portal.nav`. */
  key: 'home' | 'papers' | 'messages' | 'requests' | 'payments'
  href: string
  icon: LucideIcon
  /** Paths that highlight this tab (so /contract lights up Papers). */
  match: string[]
}

/** The client's whole navigation: five tabs, always the same. */
export const PORTAL_TABS: PortalTab[] = [
  { key: 'home', href: '/', icon: LayoutDashboard, match: ['/'] },
  { key: 'papers', href: '/papers', icon: ClipboardCheck, match: ['/papers', '/contract', '/documents'] },
  { key: 'messages', href: '/chat', icon: MessageCircle, match: ['/chat'] },
  { key: 'requests', href: '/tickets', icon: LifeBuoy, match: ['/tickets'] },
  { key: 'payments', href: '/invoices', icon: Wallet, match: ['/invoices'] },
]
