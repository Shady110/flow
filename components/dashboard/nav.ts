import {
  LayoutDashboard,
  Users,
  UserPlus,
  ListChecks,
  BarChart3,
  Wallet,
  Sparkles,
  Shield,
  MessageSquare,
  FileText,
  Globe,
  type LucideIcon,
} from 'lucide-react'
import type { PermissionKey } from '@/lib/types'

export interface NavItem {
  /** Stable i18n key under the `internal.nav` namespace. */
  key: string
  label: string
  href: string
  icon: LucideIcon
  /** Permission required to see the item. Omit = visible to any internal user. */
  permission?: PermissionKey
  /** Marks a not-yet-built section. */
  soon?: boolean
}

export const INTERNAL_NAV: NavItem[] = [
  { key: 'overview', label: 'Overview', href: '/', icon: LayoutDashboard },
  { key: 'leads', label: 'Leads', href: '/leads', icon: UserPlus, permission: 'leads.view' },
  { key: 'visitors', label: 'Visitors', href: '/visitors', icon: Globe, permission: 'leads.view' },
  { key: 'clients', label: 'Clients', href: '/clients', icon: Users, permission: 'clients.view' },
  { key: 'tasks', label: 'Tasks', href: '/tasks', icon: ListChecks, permission: 'tasks.view' },
  { key: 'inbox', label: 'Inbox', href: '/inbox', icon: MessageSquare, permission: 'chat.access' },
  { key: 'team', label: 'Team', href: '/team', icon: BarChart3, permission: 'team.view' },
  { key: 'finance', label: 'Finance', href: '/finance', icon: Wallet, permission: 'finance.view' },
  { key: 'automations', label: 'Automations', href: '/automations', icon: Sparkles, permission: 'automation.run' },
  { key: 'landing', label: 'Landing content', href: '/settings/landing', icon: FileText, permission: 'content.manage' },
  { key: 'roles', label: 'Roles & access', href: '/settings/roles', icon: Shield, permission: 'roles.manage' },
]
