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
  Settings,
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
  /** Alternative to `permission`: visible if the viewer holds ANY of these. */
  anyOf?: PermissionKey[]
  /** Marks a not-yet-built section. */
  soon?: boolean
  /** Sidebar group heading key under `internal.nav.sections`. Omit = no heading. */
  section?: 'clients' | 'delivery' | 'business'
}

/** Whether a viewer holding `perms` may see this item. */
export function canSee(item: Pick<NavItem, 'permission' | 'anyOf'>, perms: ReadonlySet<PermissionKey>): boolean {
  if (!item.permission && !item.anyOf) return true
  return (!!item.permission && perms.has(item.permission)) || !!item.anyOf?.some((p) => perms.has(p))
}

/** Rarely-visited configuration. One "Settings" item in the sidebar opens a page listing these. */
export const SETTINGS_PAGES: NavItem[] = [
  { key: 'company', label: 'Company', href: '/settings/company', icon: Building2, permission: 'settings.company' },
  { key: 'requirements', label: 'Requirements', href: '/settings/requirements', icon: ClipboardCheck, permission: 'requirements.manage' },
  { key: 'contractTemplates', label: 'Contract templates', href: '/contracts/templates', icon: FileSignature, permission: 'contracts.manage' },
  { key: 'landing', label: 'Landing content', href: '/settings/landing', icon: FileText, permission: 'content.manage' },
  { key: 'roles', label: 'Roles & access', href: '/settings/roles', icon: Shield, permission: 'roles.manage' },
]

/**
 * The sidebar: kept short on purpose. Pages that live one click inside another
 * (Tickets from Accounts, Visitors from Leads, Team from the overview) are not
 * listed here but stay reachable through the jump-to-page search (SEARCH_ONLY).
 */
export const INTERNAL_NAV: NavItem[] = [
  { key: 'overview', label: 'Overview', href: '/', icon: LayoutDashboard },
  { key: 'inbox', label: 'Inbox', href: '/inbox', icon: MessageSquare, permission: 'chat.access' },

  { key: 'pipeline', label: 'Pipeline', href: '/pipeline', icon: Kanban, permission: 'pipeline.manage', section: 'clients' },
  { key: 'leads', label: 'Leads', href: '/leads', icon: UserPlus, permission: 'leads.view', section: 'clients' },
  { key: 'clients', label: 'Clients', href: '/clients', icon: Users, permission: 'clients.view', section: 'clients' },
  { key: 'contracts', label: 'Contracts', href: '/contracts', icon: FileSignature, permission: 'contracts.manage', section: 'clients' },

  { key: 'content', label: 'Content queue', href: '/content', icon: Camera, permission: 'content.workspace', section: 'delivery' },
  { key: 'accounts', label: 'Accounts', href: '/accounts', icon: Briefcase, permission: 'accounts.workspace', section: 'delivery' },
  { key: 'automations', label: 'Automations', href: '/automations', icon: Sparkles, permission: 'automation.run', section: 'delivery' },
  { key: 'social', label: 'Social', href: '/social', icon: Megaphone, permission: 'social.view', section: 'delivery' },

  { key: 'finance', label: 'Finance', href: '/finance', icon: Wallet, permission: 'finance.view', section: 'business' },
  { key: 'tasks', label: 'Tasks', href: '/tasks', icon: ListChecks, permission: 'tasks.view', section: 'business' },

  { key: 'settings', label: 'Settings', href: '/settings', icon: Settings, anyOf: SETTINGS_PAGES.map((p) => p.permission!) },
]

/** Pages that are searchable but not in the sidebar. */
export const SEARCH_ONLY: NavItem[] = [
  { key: 'tickets', label: 'Tickets', href: '/accounts/tickets', icon: LifeBuoy, permission: 'tickets.manage' },
  { key: 'visitors', label: 'Visitors', href: '/visitors', icon: Globe, permission: 'leads.view' },
  { key: 'team', label: 'Team', href: '/team', icon: BarChart3, permission: 'team.view' },
  ...SETTINGS_PAGES,
]
