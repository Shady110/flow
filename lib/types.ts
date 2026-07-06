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
  | 'products.view'
  | 'products.manage'

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
  title: string
  description: string | null
  status: TaskStatus
  stage: string | null
  next_step: string | null
  priority: TaskPriority
  assignee_id: string | null
  created_by: string | null
  start_date: string | null
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface TaskActivity {
  id: string
  task_id: string
  actor_id: string | null
  action: string
  detail: Record<string, unknown> | null
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
