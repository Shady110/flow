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
  Megaphone,
  Kanban,
  Building2,
  ClipboardCheck,
  FileSignature,
  Camera,
  Briefcase,
  LifeBuoy,
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
  /** Sidebar group heading key under `internal.nav.sections`. Omit = no heading. */
  section?: 'ceo' | 'sales' | 'content' | 'accounts' | 'settings'
}

export const INTERNAL_NAV: NavItem[] = [
  { key: 'overview', label: 'Overview', href: '/', icon: LayoutDashboard },
  { key: 'inbox', label: 'Inbox', href: '/inbox', icon: MessageSquare, permission: 'chat.access' },
  { key: 'pipeline', label: 'Pipeline', href: '/pipeline', icon: Kanban, permission: 'pipeline.manage', section: 'ceo' },
  { key: 'clients', label: 'Clients', href: '/clients', icon: Users, permission: 'clients.view', section: 'ceo' },
  { key: 'tasks', label: 'Tasks', href: '/tasks', icon: ListChecks, permission: 'tasks.view', section: 'ceo' },
  { key: 'contracts', label: 'Contracts', href: '/contracts', icon: FileSignature, permission: 'contracts.manage', section: 'ceo' },
  { key: 'finance', label: 'Finance', href: '/finance', icon: Wallet, permission: 'finance.view', section: 'ceo' },
  { key: 'team', label: 'Team', href: '/team', icon: BarChart3, permission: 'team.view', section: 'ceo' },
  { key: 'leads', label: 'Leads', href: '/leads', icon: UserPlus, permission: 'leads.view', section: 'sales' },
  { key: 'visitors', label: 'Visitors', href: '/visitors', icon: Globe, permission: 'leads.view', section: 'sales' },
  { key: 'content', label: 'Content queue', href: '/content', icon: Camera, permission: 'content.workspace', section: 'content' },
  { key: 'social', label: 'Social', href: '/social', icon: Megaphone, permission: 'social.view', section: 'content' },
  { key: 'automations', label: 'Automations', href: '/automations', icon: Sparkles, permission: 'automation.run', section: 'content' },
  { key: 'accounts', label: 'Accounts', href: '/accounts', icon: Briefcase, permission: 'accounts.workspace', section: 'accounts' },
  { key: 'tickets', label: 'Tickets', href: '/accounts/tickets', icon: LifeBuoy, permission: 'tickets.manage', section: 'accounts' },
  { key: 'company', label: 'Company', href: '/settings/company', icon: Building2, permission: 'settings.company', section: 'settings' },
  { key: 'requirements', label: 'Requirements', href: '/settings/requirements', icon: ClipboardCheck, permission: 'requirements.manage', section: 'settings' },
  { key: 'landing', label: 'Landing content', href: '/settings/landing', icon: FileText, permission: 'content.manage', section: 'settings' },
  { key: 'roles', label: 'Roles & access', href: '/settings/roles', icon: Shield, permission: 'roles.manage', section: 'settings' },
]
