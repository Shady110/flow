// Runtime constants kept OUT of lib/types.ts so that the types module stays
// type-only. Mixing `export type` and `export const` in one module can make
// Turbopack hand back `undefined` for the value exports in the client bundle.

import type {
  PermissionKey,
  ProductStatus,
  ClientStatus,
  LeadStatus,
  TaskStatus,
  TaskPriority,
  InvoiceStatus,
} from '@/lib/types'

/** Default trading currency for the agency. */
export const DEFAULT_CURRENCY = 'EGP'

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  void: 'Void',
}

export const PAYMENT_METHODS = ['Cash', 'Bank transfer', 'InstaPay', 'Card', 'Other'] as const

/** Every permission key — co-founders implicitly hold all of these. */
export const ALL_PERMISSION_KEYS: PermissionKey[] = [
  'clients.view', 'clients.create', 'clients.edit', 'clients.delete',
  'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign',
  'leads.view', 'leads.create', 'leads.edit', 'leads.delete', 'leads.convert',
  'team.view', 'finance.view', 'finance.manage', 'invoices.issue',
  'chat.access', 'automation.run', 'roles.manage', 'users.invite',
  'users.manage', 'settings.manage', 'content.manage', 'products.view', 'products.manage',
]

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: 'Draft',
  in_progress: 'In progress',
  review: 'In review',
  live: 'Live',
  rejected: 'Rejected',
  paused: 'Paused',
}

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  lead: 'Lead',
  active: 'Active',
  paused: 'Paused',
  churned: 'Churned',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  blocked: 'Blocked',
  review: 'Review',
  done: 'Done',
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal: 'Proposal sent',
  won: 'Won',
  lost: 'Lost',
}

/** Pipeline order for pickers and board-style displays. */
export const LEAD_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'won',
  'lost',
]
