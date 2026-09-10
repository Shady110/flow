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
  created_by: string | null
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
  created_by: string | null
  created_at: string
  updated_at: string
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
