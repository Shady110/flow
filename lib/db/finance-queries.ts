import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { invoiceTotal } from '@/lib/money'
import type { Invoice, InvoiceItem, Payment, Expense } from '@/lib/types'

export interface InvoiceWithMeta extends Invoice {
  client_name: string
  items: InvoiceItem[]
  total: number
  paid: number
  balance: number
}

function mapInvoice(row: Invoice & {
  client?: { name: string } | { name: string }[] | null
  invoice_items?: InvoiceItem[]
  payments?: { amount: number }[]
}): InvoiceWithMeta {
  const client = Array.isArray(row.client) ? row.client[0] : row.client
  const items = (row.invoice_items ?? []).slice().sort((a, b) => a.position - b.position)
  const total = invoiceTotal(items)
  const paid = (row.payments ?? []).reduce((s, p) => s + Number(p.amount), 0)
  return {
    ...row,
    client_name: client?.name ?? '—',
    items,
    total,
    paid,
    balance: Math.max(0, total - paid),
  }
}

export async function getInvoices(clientId?: string): Promise<InvoiceWithMeta[]> {
  const supabase = await createClient()
  let q = supabase
    .from('invoices')
    .select('*, client:clients(name), invoice_items(*), payments(amount)')
    .order('created_at', { ascending: false })
  if (clientId) q = q.eq('client_id', clientId)
  const { data } = await q
  return ((data as Parameters<typeof mapInvoice>[0][]) ?? []).map(mapInvoice)
}

export async function getInvoice(id: string): Promise<InvoiceWithMeta | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('invoices')
    .select('*, client:clients(name), invoice_items(*), payments(amount)')
    .eq('id', id)
    .maybeSingle()
  return data ? mapInvoice(data as Parameters<typeof mapInvoice>[0]) : null
}

export async function getPayments(clientId?: string): Promise<
  (Payment & { invoice_number: string | null })[]
> {
  const supabase = await createClient()
  let q = supabase
    .from('payments')
    .select('*, invoice:invoices(number)')
    .order('paid_at', { ascending: false })
  if (clientId) q = q.eq('client_id', clientId)
  const { data } = await q
  return (
    (data as (Payment & { invoice: { number: string } | { number: string }[] | null })[])?.map((p) => {
      const inv = Array.isArray(p.invoice) ? p.invoice[0] : p.invoice
      return { ...p, invoice_number: inv?.number ?? null }
    }) ?? []
  )
}

export async function getExpenses(): Promise<Expense[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('expenses').select('*').order('incurred_on', { ascending: false })
  return (data as Expense[]) ?? []
}

export interface FinanceSummary {
  revenue: number
  revenueThisMonth: number
  outstanding: number
  expensesTotal: number
  profit: number
  currency: string
  monthly: { name: string; Revenue: number; Expenses: number }[]
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const [invoices, payments, expenses] = await Promise.all([getInvoices(), getPayments(), getExpenses()])

  const now = new Date()
  const revenue = payments.reduce((s, p) => s + Number(p.amount), 0)
  const revenueThisMonth = payments
    .filter((p) => {
      const d = new Date(p.paid_at)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    .reduce((s, p) => s + Number(p.amount), 0)

  // Owed to us: unpaid balance on issued (non-draft, non-void) invoices.
  const outstanding = invoices
    .filter((i) => i.status === 'sent' || i.status === 'paid')
    .reduce((s, i) => s + i.balance, 0)

  const expensesTotal = expenses.reduce((s, e) => s + Number(e.amount), 0)

  // Last 6 months revenue vs expenses.
  const buckets = new Map<string, { name: string; Revenue: number; Expenses: number }>()
  for (let k = 5; k >= 0; k--) {
    const d = new Date(now.getFullYear(), now.getMonth() - k, 1)
    buckets.set(monthKey(d), { name: d.toLocaleDateString(undefined, { month: 'short' }), Revenue: 0, Expenses: 0 })
  }
  for (const p of payments) {
    const b = buckets.get(monthKey(new Date(p.paid_at)))
    if (b) b.Revenue += Number(p.amount)
  }
  for (const e of expenses) {
    const b = buckets.get(monthKey(new Date(e.incurred_on)))
    if (b) b.Expenses += Number(e.amount)
  }

  return {
    revenue,
    revenueThisMonth,
    outstanding,
    expensesTotal,
    profit: revenue - expensesTotal,
    currency: invoices[0]?.currency ?? 'EGP',
    monthly: [...buckets.values()],
  }
}
