import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { getClients, getTasks, getTeam } from '@/lib/db/queries'
import { getLeads, getLeadCapInfo } from '@/lib/db/lead-queries'
import { getPlatforms } from '@/lib/db/flow-queries'
import { getInvoices, getFinanceSummary, type FinanceSummary } from '@/lib/db/finance-queries'
import { getTickets } from '@/lib/db/ticket-queries'
import { getDeliverableProgress } from '@/lib/db/requirement-queries'
import {
  budgetVsCost,
  needsAttention,
  pipelineCounts,
  workloadByPerson,
  type AttentionItem,
  type PipelineColumn,
  type WorkloadRow,
} from '@/lib/overview'
import type { StageEvent } from '@/lib/types'

export interface CeoOverview {
  kpis: {
    activeClients: number
    newClientsThisMonth: number
    cap: { won: number; cap: number }
    accountsLive: number
    accountsAtRisk: number
    openTickets: number
    urgentTickets: number
  }
  pipeline: Record<PipelineColumn, number>
  attention: AttentionItem[]
  workload: WorkloadRow[]
  finance: FinanceSummary
  budget: ReturnType<typeof budgetVsCost>
  events: (StageEvent & { client_name: string; platform: string | null; actor_name: string | null })[]
  clientNames: Record<string, string>
}

/**
 * Everything the CEO home shows, from one round of parallel RLS-scoped reads.
 * The shaping (counts, ordering, thresholds) lives in lib/overview.ts so it can be tested.
 */
export async function getCeoOverview(): Promise<CeoOverview> {
  const supabase = await createClient()
  const now = new Date()

  const [clients, platforms, leads, tickets, invoices, tasks, team, finance, cap, contracts, docs, eventsRes] =
    await Promise.all([
      getClients(),
      getPlatforms(),
      getLeads(),
      getTickets({ status: 'active' }),
      getInvoices(),
      getTasks(undefined, { parentOnly: true }),
      getTeam(),
      getFinanceSummary(),
      getLeadCapInfo(true),
      supabase.from('contracts').select('client_id, sent_at').eq('status', 'sent'),
      supabase.from('client_requirements').select('client_id').eq('kind', 'client_document').eq('status', 'submitted'),
      supabase.from('stage_events').select('*').order('created_at', { ascending: false }).limit(8),
    ])

  const listing = platforms.filter((p) => p.stage === 'listing')
  const progress = await getDeliverableProgress(listing.map((p) => p.id))

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const clientName = Object.fromEntries(clients.map((c) => [c.id, c.name]))
  const platformById = new Map(platforms.map((p) => [p.id, p]))
  const personName = new Map(team.map((m) => [m.id, m.full_name ?? '—']))

  const openTasks = tasks.filter((t) => t.status !== 'done')

  return {
    kpis: {
      activeClients: clients.filter((c) => c.status === 'active').length,
      newClientsThisMonth: clients.filter((c) => new Date(c.created_at) >= monthStart).length,
      cap: { won: cap.won, cap: cap.cap },
      accountsLive: platforms.filter((p) => p.stage === 'managing').length,
      accountsAtRisk: platforms.filter((p) => p.account_status === 'at_risk' || p.account_status === 'suspended').length,
      openTickets: tickets.length,
      urgentTickets: tickets.filter((t) => t.priority === 'urgent' || t.priority === 'high').length,
    },
    pipeline: pipelineCounts({ leads, clients, platforms }),
    attention: needsAttention(
      {
        contractsSent: (contracts.data as { client_id: string; sent_at: string | null }[]) ?? [],
        documentsSubmitted: (docs.data as { client_id: string }[]) ?? [],
        listing: listing.map((p) => ({
          id: p.id,
          client_id: p.client_id,
          updated_at: p.updated_at,
          missing: progress.get(p.id)?.missing ?? 0,
        })),
        tickets,
        invoices: invoices.filter((i) => i.status === 'sent'),
        tasks: openTasks,
      },
      now,
    ),
    workload: workloadByPerson({
      team: team.map((m) => ({ id: m.id, name: m.full_name ?? '—', role: m.role_name })),
      leads,
      platforms,
      tickets,
      tasks: openTasks,
      listingCount: listing.length,
    }),
    finance,
    budget: budgetVsCost(clients),
    events: ((eventsRes.data as StageEvent[]) ?? []).map((e) => ({
      ...e,
      client_name: clientName[e.client_id] ?? '—',
      platform: e.platform_id ? (platformById.get(e.platform_id)?.platform ?? null) : null,
      actor_name: e.actor_id ? (personName.get(e.actor_id) ?? null) : null,
    })),
    clientNames: clientName,
  }
}
