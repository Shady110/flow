// How an invoice looks to the client: still to pay, overdue, or paid. Pure + tested.

export type InvoiceState = 'paid' | 'overdue' | 'due'

export function invoiceState(
  invoice: { balance: number; due_date: string | null },
  now: Date = new Date(),
): InvoiceState {
  if (invoice.balance <= 0) return 'paid'
  if (invoice.due_date && invoice.due_date < now.toISOString().slice(0, 10)) return 'overdue'
  return 'due'
}
