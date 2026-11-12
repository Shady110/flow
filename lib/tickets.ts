// Ticket vocabulary shared by the portal and the accounts workspace. Pure data —
// labels live in the `tickets` i18n catalogs under `categories.<key>`.
import type { Marketplace, TicketPriority, TicketStatus } from './types'

export const TICKET_STATUSES: TicketStatus[] = ['open', 'in_progress', 'waiting_client', 'resolved', 'closed']
export const TICKET_PRIORITIES: TicketPriority[] = ['low', 'normal', 'high', 'urgent']
/** Statuses that still need someone's attention. */
export const ACTIVE_TICKET_STATUSES: TicketStatus[] = ['open', 'in_progress', 'waiting_client']

const BASE = ['listing_issue', 'account_health', 'price_stock', 'new_products', 'ads', 'other'] as const

/** What a client can ask for, per marketplace (a few are platform-specific). */
export const TICKET_CATEGORIES: Record<Marketplace, readonly string[]> = {
  amazon: ['listing_issue', 'account_health', 'brand_registry', 'price_stock', 'new_products', 'ads', 'other'],
  noon: ['listing_issue', 'account_health', 'catalog_qc', 'price_stock', 'new_products', 'ads', 'other'],
  jumia: BASE,
}
