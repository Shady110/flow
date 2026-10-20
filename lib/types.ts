// Domain types shared across the dashboard. Mirrors the SQL schema.

export type PermissionKey =
  | 'clients.view'
  | 'clients.create'
  | 'clients.edit'
  | 'clients.delete'
  | 'tasks.view'
  | 'tasks.create'
  | 'tasks.edit'
  | 'tasks.delete'
  | 'tasks.assign'
  | 'leads.view'
  | 'leads.create'
  | 'leads.edit'
  | 'leads.delete'
  | 'leads.convert'
  | 'team.view'
  | 'finance.view'
  | 'finance.manage'
  | 'invoices.issue'
  | 'chat.access'
  | 'automation.run'
  | 'roles.manage'
  | 'users.invite'
  | 'users.manage'
  | 'settings.manage'
  | 'content.manage'
  | 'products.view'
  | 'products.manage'
  | 'social.view'
  | 'social.create'
  | 'social.publish'
  | 'ops.overview'
  | 'pipeline.manage'
  | 'settings.company'
  | 'requirements.manage'
  | 'contracts.manage'
  | 'sales.workspace'
  | 'content.workspace'
  | 'accounts.workspace'
  | 'accounts.view_all'
  | 'tickets.manage'

export type ProfileStatus = 'invited' | 'active' | 'disabled'
export type ClientStatus = 'lead' | 'active' | 'paused' | 'churned'
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Role {
  id: string
  name: string
  description: string | null
  is_system: boolean
  created_at: string
}

export interface Permission {
  key: PermissionKey
  label: string
  category: string
}

export interface Profile {
  id: string
  role_id: string | null
  full_name: string | null
  avatar_url: string | null
  status: ProfileStatus
  created_at: string
}

/** Profile enriched with its role + resolved permission set (server-computed). */
export interface CurrentUser {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  status: ProfileStatus
  role: Pick<Role, 'id' | 'name' | 'is_system'> | null
  permissions: Set<PermissionKey>
}

export interface Client {
  id: string
  slug: string
  name: string
  logo_url: string | null
  brand_color: string | null
  status: ClientStatus
  health: number | null
  notes: string | null
  stage: ClientStage
  budget: number | null
  estimated_cost: number | null
  target_live_date: string | null
  /** Contract terms agreed in sales; see lib/deals.ts. */
  deal: unknown | null
  created_by: string | null
  created_at: string
}

export type ClientStage = 'group_created' | 'paperwork' | 'onboarded'
export type PlatformStage = 'platform_creation' | 'listing' | 'pushing' | 'managing'
export type Marketplace = 'amazon' | 'noon' | 'jumia'
export type AccountStatus = 'not_created' | 'active' | 'at_risk' | 'suspended' | 'deactivated'

/** One client × marketplace account, moving through its own stages. */
export interface ClientPlatform {
  id: string
  client_id: string
  platform: Marketplace
  /** The stages that apply to this account, in flow order. */
  stages: PlatformStage[]
  stage: PlatformStage
  account_manager_id: string | null
  account_status: AccountStatus
  store_name: string | null
  seller_id: string | null
  status_note: string | null
  checked_at: string | null
  created_at: string
  updated_at: string
}

export interface StageEvent {
  id: string
  client_id: string
  platform_id: string | null
  from_stage: string | null
  to_stage: string
  actor_id: string | null
  created_at: string
}

export interface Task {
  id: string
  client_id: string
  /** Set on subtasks; a "big task" is simply a task with children. */
  parent_task_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  stage: string | null
  next_step: string | null
  priority: TaskPriority
  created_by: string | null
  start_date: string | null
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

/** A task joined with its assignees and subtask roll-up (computed in queries). */
export interface TaskRow extends Task {
  assignee_ids: string[]
  subtask_total: number
  subtask_done: number
}

export interface TaskActivity {
  id: string
  task_id: string
  actor_id: string | null
  action: string
  detail: Record<string, unknown> | null
  created_at: string
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'

export interface Lead {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  address: string | null
  /** Geography — Nasr City, Alexandria, … */
  area: string | null
  /** Industry / product category. */
  field: string | null
  status: LeadStatus
  source: string | null
  plan_interest: string | null
  notes: string | null
  owner_id: string | null
  converted_client_id: string | null
  /** What they're interested in (marketplaces, contract length, package phases); see lib/deals.ts. */
  deal: unknown | null
  won_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ContactMethod = 'call' | 'whatsapp' | 'sms' | 'email' | 'meeting' | 'other'

export interface LeadActivity {
  id: string
  lead_id: string
  method: ContactMethod
  note: string | null
  status_after: LeadStatus | null
  created_by: string | null
  created_at: string
}

export type ProductStatus = 'draft' | 'in_progress' | 'review' | 'live' | 'rejected' | 'paused'

export interface ClientUser {
  id: string
  client_id: string
  user_id: string | null
  full_name: string
  email: string
  role_at_company: string | null
  status: string
  created_at: string
}

export interface Product {
  id: string
  client_id: string
  name: string
  sku: string | null
  marketplace: string | null
  status: ProductStatus
  image_url: string | null
  price: number | null
  notes: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  client_id: string
  client_user_id: string
  subject: string | null
  last_message_at: string | null
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_type: 'admin' | 'client'
  sender_profile_id: string | null
  sender_client_user_id: string | null
  body: string
  read_at: string | null
  created_at: string
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'void'

export interface Invoice {
  id: string
  client_id: string
  number: string
  status: InvoiceStatus
  currency: string
  issue_date: string
  due_date: string | null
  notes: string | null
  /** First day of the month an auto-created invoice bills; null for manual invoices. */
  billing_period: string | null
  source: 'manual' | 'auto'
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  position: number
}

export interface Payment {
  id: string
  client_id: string
  invoice_id: string | null
  amount: number
  method: string | null
  paid_at: string
  notes: string | null
  /** 'kashier' | 'mock' when paid online; null for manual payments. */
  gateway: string | null
  gateway_ref: string | null
  created_by: string | null
  created_at: string
}

export interface Expense {
  id: string
  client_id: string | null
  category: string | null
  description: string | null
  amount: number
  incurred_on: string
  created_by: string | null
  created_at: string
}

export type AutomationType = 'listing' | 'image'
export type JobStatus = 'draft' | 'processing' | 'done' | 'failed'
export type ItemStatus = 'queued' | 'processing' | 'done' | 'failed'

/** Listing job stages. `full` runs collecting then Amazon in one pass;
 *  `amazon` skips generation and consumes an edited collecting sheet. */
export type ListingStage = 'collecting' | 'full' | 'amazon'

export interface ListingJobParams {
  stage: ListingStage
  /** Uploaded Amazon flat file in automation-inputs, re-parsed per batch. */
  templatePath?: string
  productType?: string
  /** Job-level answers keyed by CONSTANT_LABELS values. */
  constants?: Record<string, string>
  outputs?: { collecting?: string; amazon?: string }
}

export interface AutomationJob {
  id: string
  type: AutomationType
  status: JobStatus
  client_id: string | null
  marketplace: string | null
  params: Record<string, unknown>
  input_path: string | null
  output_path: string | null
  total: number
  done_count: number
  failed_count: number
  error: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface AutomationItem {
  id: string
  job_id: string
  status: ItemStatus
  position: number
  input: Record<string, unknown>
  output: Record<string, unknown> | null
  error: string | null
  created_at: string
}

// Runtime label maps + ALL_PERMISSION_KEYS live in lib/constants.ts so this
// module stays type-only (see the note there).

// ── Social planner (migration 0012) ─────────────────────────────────────────

export type SocialPlatform = 'instagram' | 'facebook' | 'linkedin'
export type SocialPillar = 'proof' | 'teach' | 'process' | 'offer' | 'pulse'
export type SocialFormat = 'reel' | 'carousel' | 'static' | 'story' | 'text' | 'article'
export type SocialPostStatus =
  | 'idea'
  | 'draft'
  | 'needs_design'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'failed'

export interface SocialCampaign {
  id: string
  slug: string
  name: string
  starts_at: string
  ends_at: string
  goal: string | null
  colour: string | null
  dates_provisional: boolean
  created_at: string
  updated_at: string
}

export interface SocialPost {
  id: string
  campaign_id: string | null
  platform: SocialPlatform
  pillar: SocialPillar
  format: SocialFormat
  status: SocialPostStatus
  hook: string
  caption_en: string | null
  caption_ar: string | null
  hashtags: string[]
  design_brief: string | null
  template: string | null
  scheduled_at: string | null
  published_at: string | null
  link_url: string | null
  utm_campaign: string | null
  utm_content: string | null
  media_path: string | null
  external_post_id: string | null
  error: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface SocialAccount {
  id: string
  platform: SocialPlatform
  external_id: string | null
  display_name: string
  token_ref: string | null
  token_expires_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type RequirementKind = 'client_document' | 'content_deliverable'
export type RequirementStatus = 'pending' | 'submitted' | 'approved' | 'rejected' | 'waived'

export interface RequirementTemplateItem {
  id: string
  template_id: string
  label_en: string
  label_ar: string | null
  hint: string | null
  required: boolean
  position: number
}

export interface RequirementTemplate {
  id: string
  name: string
  kind: RequirementKind
  platform: Marketplace | null
  created_at: string
  items: RequirementTemplateItem[]
}

/** One file slot asked of a client (document) or of Content (deliverable). */
export interface ClientRequirement {
  id: string
  client_id: string
  platform_id: string | null
  kind: RequirementKind
  label_en: string
  label_ar: string | null
  hint: string | null
  required: boolean
  position: number
  status: RequirementStatus
  file_path: string | null
  file_name: string | null
  note: string | null
  uploaded_by: string | null
  submitted_at: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export type ContractStatus = 'draft' | 'sent' | 'accepted' | 'void'

export interface ContractTemplate {
  id: string
  name: string
  locale: 'en' | 'ar'
  body: string
  created_at: string
}

export interface Contract {
  id: string
  client_id: string
  template_id: string | null
  title: string
  locale: 'en' | 'ar'
  body: string
  body_sha256: string | null
  /** The deal this contract states; shape in lib/deals.ts. */
  terms: unknown | null
  start_date: string | null
  status: ContractStatus
  sent_at: string | null
  accepted_at: string | null
  accepted_name: string | null
  accepted_ip: string | null
  accepted_ua: string | null
  accepted_by: string | null
  accepted_offline: boolean
  created_by: string | null
  created_at: string
}

export type TicketStatus = 'open' | 'in_progress' | 'waiting_client' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Ticket {
  id: string
  number: string
  client_id: string
  platform_id: string
  category: string
  title: string
  body: string | null
  status: TicketStatus
  priority: TicketPriority
  source: 'portal' | 'offline'
  created_by_client_user: string | null
  created_by_profile: string | null
  assignee_id: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_type: 'staff' | 'client'
  sender_profile_id: string | null
  sender_client_user_id: string | null
  body: string
  created_at: string
}

export type CheckoutStatus = 'created' | 'paid' | 'failed' | 'expired'

export interface CheckoutSession {
  id: string
  invoice_id: string
  client_id: string
  provider: string
  provider_session_id: string | null
  merchant_order_id: string
  amount: number
  currency: string
  status: CheckoutStatus
  save_card: boolean
  session_url: string | null
  failure_reason: string | null
  created_at: string
  paid_at: string | null
}

/** What a browser may know about a client's saved card (never the token). */
export interface ClientBillingPublic {
  client_id: string
  auto_renew: boolean
  provider: string | null
  card_brand: string | null
  card_last4: string | null
  status: 'none' | 'active' | 'failed' | 'canceled'
  failure_count: number
  last_charge_at: string | null
}
