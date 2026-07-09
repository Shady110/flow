import {
  LayoutDashboard,
  Users,
  ListChecks,
  BarChart3,
  Wallet,
  Sparkles,
  Shield,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react'
import type { PermissionKey } from '@/lib/types'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** Permission required to see the item. Omit = visible to any internal user. */
  permission?: PermissionKey
  /** Marks a not-yet-built section. */
  soon?: boolean
}

export const INTERNAL_NAV: NavItem[] = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Clients', href: '/clients', icon: Users, permission: 'clients.view' },
  { label: 'Tasks', href: '/tasks', icon: ListChecks, permission: 'tasks.view' },
  { label: 'Inbox', href: '/inbox', icon: MessageSquare, permission: 'chat.access' },
  { label: 'Team', href: '/team', icon: BarChart3, permission: 'team.view' },
  { label: 'Finance', href: '/finance', icon: Wallet, permission: 'finance.view' },
  { label: 'Automations', href: '/automations', icon: Sparkles, permission: 'automation.run' },
  { label: 'Roles & access', href: '/settings/roles', icon: Shield, permission: 'roles.manage' },
]
