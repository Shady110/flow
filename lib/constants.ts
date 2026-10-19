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
  SocialPlatform,
  SocialPillar,
  SocialFormat,
  SocialPostStatus,
  ClientStage,
  PlatformStage,
  Marketplace,
  AccountStatus,
  RequirementKind,
  RequirementStatus,
  ContactMethod,
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
  'social.view', 'social.create', 'social.publish',
  'ops.overview', 'pipeline.manage', 'settings.company', 'requirements.manage', 'contracts.manage',
  'sales.workspace', 'content.workspace', 'accounts.workspace', 'accounts.view_all', 'tickets.manage',
]

/** Flow order. Labels live in the `internal.flow` i18n catalog. */
export const CLIENT_STAGES: ClientStage[] = ['group_created', 'paperwork', 'onboarded']
export const PLATFORM_STAGES: PlatformStage[] = ['platform_creation', 'listing', 'pushing', 'managing']
export const MARKETPLACES: Marketplace[] = ['amazon', 'noon', 'jumia']
export const ACCOUNT_STATUSES: AccountStatus[] = [
  'not_created', 'active', 'at_risk', 'suspended', 'deactivated',
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


/** Enum order for pickers. Labels come from the `internal.status` catalog. */
export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'review', 'done']
export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent']



/** Sentinel for the leads "owner: unassigned" filter — can't collide with a uuid. */
export const UNASSIGNED_OWNER = 'unassigned'

/** Pipeline order for pickers and board-style displays. */
export const LEAD_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'won',
  'lost',
]

/** Enum order for pickers. Labels come from the `internal.social` catalog. */
export const SOCIAL_PLATFORMS: SocialPlatform[] = ['instagram', 'facebook', 'linkedin']
export const SOCIAL_PILLARS: SocialPillar[] = ['proof', 'teach', 'process', 'offer', 'pulse']
export const SOCIAL_FORMATS: SocialFormat[] = [
  'reel', 'carousel', 'static', 'story', 'text', 'article',
]
export const SOCIAL_POST_STATUSES: SocialPostStatus[] = [
  'idea', 'draft', 'needs_design', 'approved', 'scheduled', 'published', 'failed',
]

/**
 * Statuses a post can reach without anything being published. Used to keep the
 * calendar's "still to do" count honest.
 */
export const SOCIAL_OPEN_STATUSES: SocialPostStatus[] = [
  'idea', 'draft', 'needs_design', 'approved',
]

export const REQUIREMENT_KINDS: RequirementKind[] = ['client_document', 'content_deliverable']
export const REQUIREMENT_STATUSES: RequirementStatus[] = [
  'pending', 'submitted', 'approved', 'rejected', 'waived',
]
/** Largest file the browser will try to upload (the bucket enforces 20 MB too). */
export const MAX_UPLOAD_MB = 20
export const CLIENT_FILES_BUCKET = 'client-files'

export const CONTACT_METHODS: ContactMethod[] = ['call', 'whatsapp', 'sms', 'email', 'meeting', 'other']
