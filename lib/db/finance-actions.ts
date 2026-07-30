'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { invoiceTotal } from '@/lib/money'
import type { ActionResult } from '@/lib/db/client-actions'

type Supa = Awaited<ReturnType<typeof createClient>>

/**
 * Re-derive an invoice's paid/sent status from its items and payments. Called
 * after anything that moves the total or the amount received, so a corrected
 * payment can un-pay an invoice as well as pay it.
 */
async function syncInvoiceStatus(supabase: Supa, invoiceId: string) {
  const [{ data: invoice }, { data: items }, { data: pays }] = await Promise.all([
    supabase.from('invoices').select('status').eq('id', invoiceId).maybeSingle(),
    supabase.from('invoice_items').select('quantity, unit_price').eq('invoice_id', invoiceId),
    supabase.from('payments').select('amount').eq('invoice_id', invoiceId),
  ])
  // A voided or draft invoice isn't waiting on money; leave it alone.
  if (!invoice || invoice.status === 'void' || invoice.status === 'draft') return

  const total = invoiceTotal((items as { quantity: number; unit_price: number }[]) ?? [])
  const paid = ((pays as { amount: number }[]) ?? []).reduce((s, p) => s + Number(p.amount), 0)
  const next = total > 0 && paid >= total ? 'paid' : 'sent'
  if (next !== invoice.status) {
    await supabase.from('invoices').update({ status: next }).eq('id', invoiceId)
  }
}

const itemSchema = z.object({
  description: z.string().min(1, 'Item description required'),
  quantity: z.coerce.number().positive(),
  unit_price: z.coerce.number().min(0),
})

const invoiceSchema = z.object({
  client_id: z.string().uuid(),
  issue_date: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1, 'Add at least one line item'),
})

export async function createInvoiceAction(
  input: unknown,
): Promise<ActionResult & { invoiceId?: string }> {
  const parsed = invoiceSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const { client_id, issue_date, due_date, notes, items } = parsed.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      client_id,
      issue_date: issue_date || undefined,
      due_date: due_date || null,
      notes: notes || null,
      created_by: user?.id ?? null,
    })
    .select('id')
    .single()
  if (error) return { ok: false, error: error.message }

  const rows = items.map((it, i) => ({
    invoice_id: invoice.id,
    description: it.description,
    quantity: it.quantity,
    unit_price: it.unit_price,
    position: i,
  }))
  const { error: itemErr } = await supabase.from('invoice_items').insert(rows)
  if (itemErr) return { ok: false, error: itemErr.message }

  revalidatePath('/finance')
  revalidatePath(`/clients/${client_id}`)
  return { ok: true, invoiceId: invoice.id }
}

/**
 * Edit an issued invoice: dates, notes and line items. Items are replaced
 * wholesale (the same delete-then-insert shape used for role permissions) —
 * positions are re-derived from the submitted order.
 */
export async function updateInvoiceAction(id: string, input: unknown): Promise<ActionResult> {
  const parsed = invoiceSchema.partial({ client_id: true }).safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const { issue_date, due_date, notes, items } = parsed.data

  const supabase = await createClient()
  const { error } = await supabase
    .from('invoices')
    .update({
      issue_date: issue_date || undefined,
      due_date: due_date || null,
      notes: notes || null,
    })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }

  if (items) {
    const { error: delErr } = await supabase.from('invoice_items').delete().eq('invoice_id', id)
    if (delErr) return { ok: false, error: delErr.message }
    const { error: insErr } = await supabase.from('invoice_items').insert(
      items.map((it, i) => ({
        invoice_id: id,
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price,
        position: i,
      })),
    )
    if (insErr) return { ok: false, error: insErr.message }
    // The total moved, so the paid/unpaid verdict may have moved with it.
    await syncInvoiceStatus(supabase, id)
  }

  revalidatePath('/finance')
  revalidatePath(`/finance/invoices/${id}`)
  if (parsed.data.client_id) revalidatePath(`/clients/${parsed.data.client_id}`)
  return { ok: true }
}

export async function updateInvoiceStatusAction(
  id: string,
  status: 'draft' | 'sent' | 'paid' | 'void',
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('invoices').update({ status }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/finance')
  revalidatePath(`/finance/invoices/${id}`)
  return { ok: true }
}

export async function deleteInvoiceAction(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('invoices').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/finance')
  return { ok: true }
}

const paymentSchema = z.object({
  client_id: z.string().uuid(),
  invoice_id: z.string().uuid().optional().nullable(),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  method: z.string().optional().nullable(),
  paid_at: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export async function recordPaymentAction(input: unknown): Promise<ActionResult> {
  const parsed = paymentSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const d = parsed.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('payments').insert({
    client_id: d.client_id,
    invoice_id: d.invoice_id || null,
    amount: d.amount,
    method: d.method || null,
    paid_at: d.paid_at || undefined,
    notes: d.notes || null,
    created_by: user?.id ?? null,
  })
  if (error) return { ok: false, error: error.message }

  // Auto-mark the invoice paid once it's fully covered.
  if (d.invoice_id) {
    await syncInvoiceStatus(supabase, d.invoice_id)
    revalidatePath(`/finance/invoices/${d.invoice_id}`)
  }

  revalidatePath('/finance')
  revalidatePath(`/clients/${d.client_id}`)
  return { ok: true }
}

export async function updatePaymentAction(id: string, input: unknown): Promise<ActionResult> {
  const parsed = paymentSchema.partial().safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const d = parsed.data

  const supabase = await createClient()
  // The invoice link may be changing, so both old and new need re-deriving.
  const { data: before } = await supabase
    .from('payments')
    .select('invoice_id, client_id')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase
    .from('payments')
    .update({
      ...(d.invoice_id !== undefined ? { invoice_id: d.invoice_id || null } : {}),
      ...(d.amount !== undefined ? { amount: d.amount } : {}),
      ...(d.method !== undefined ? { method: d.method || null } : {}),
      ...(d.paid_at ? { paid_at: d.paid_at } : {}),
      ...(d.notes !== undefined ? { notes: d.notes || null } : {}),
    })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }

  for (const invId of new Set([before?.invoice_id, d.invoice_id].filter(Boolean) as string[])) {
    await syncInvoiceStatus(supabase, invId)
    revalidatePath(`/finance/invoices/${invId}`)
  }
  revalidatePath('/finance')
  if (before?.client_id) revalidatePath(`/clients/${before.client_id}`)
  return { ok: true }
}

export async function deletePaymentAction(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: before } = await supabase
    .from('payments')
    .select('invoice_id, client_id')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase.from('payments').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  if (before?.invoice_id) {
    // Removing money received can take an invoice back out of "paid".
    await syncInvoiceStatus(supabase, before.invoice_id)
    revalidatePath(`/finance/invoices/${before.invoice_id}`)
  }
  revalidatePath('/finance')
  if (before?.client_id) revalidatePath(`/clients/${before.client_id}`)
  return { ok: true }
}

const expenseSchema = z.object({
  client_id: z.string().uuid().optional().nullable(),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  incurred_on: z.string().optional().nullable(),
})

export async function addExpenseAction(input: unknown): Promise<ActionResult> {
  const parsed = expenseSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const d = parsed.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('expenses').insert({
    client_id: d.client_id || null,
    category: d.category || null,
    description: d.description || null,
    amount: d.amount,
    incurred_on: d.incurred_on || undefined,
    created_by: user?.id ?? null,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/finance')
  return { ok: true }
}

export async function updateExpenseAction(id: string, input: unknown): Promise<ActionResult> {
  const parsed = expenseSchema.partial().safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const d = parsed.data

  const supabase = await createClient()
  const { error } = await supabase
    .from('expenses')
    .update({
      ...(d.client_id !== undefined ? { client_id: d.client_id || null } : {}),
      ...(d.category !== undefined ? { category: d.category || null } : {}),
      ...(d.description !== undefined ? { description: d.description || null } : {}),
      ...(d.amount !== undefined ? { amount: d.amount } : {}),
      ...(d.incurred_on ? { incurred_on: d.incurred_on } : {}),
    })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/finance')
  return { ok: true }
}

export async function deleteExpenseAction(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/finance')
  return { ok: true }
}
