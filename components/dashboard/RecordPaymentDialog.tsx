'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { recordPaymentAction, updatePaymentAction } from '@/lib/db/finance-actions'
import { PAYMENT_METHODS } from '@/lib/constants'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ds/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ds/dialog'

interface Option {
  id: string
  label: string
}
interface InvoiceOption {
  id: string
  label: string
  client_id: string
}

const NO_INVOICE = '__none__'

/** The subset of a payment this dialog can edit. */
interface EditablePayment {
  id: string
  client_id: string
  invoice_id: string | null
  amount: number
  method: string | null
  paid_at: string
}

export function RecordPaymentDialog({
  clients,
  invoices = [],
  fixedClientId,
  fixedInvoiceId,
  payment,
  trigger,
}: {
  clients: Option[]
  invoices?: InvoiceOption[]
  fixedClientId?: string
  fixedInvoiceId?: string
  /** Pass a payment to correct it instead of recording a new one. */
  payment?: EditablePayment
  trigger?: React.ReactNode
}) {
  const router = useRouter()
  const editing = !!payment
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clientId, setClientId] = useState(payment?.client_id ?? fixedClientId ?? clients[0]?.id ?? '')
  const [invoiceId, setInvoiceId] = useState(payment?.invoice_id ?? fixedInvoiceId ?? NO_INVOICE)
  const [amount, setAmount] = useState(payment ? String(payment.amount) : '')
  const [method, setMethod] = useState<string>(payment?.method ?? PAYMENT_METHODS[0])
  const [paidAt, setPaidAt] = useState(payment?.paid_at?.slice(0, 10) ?? '')

  const clientInvoices = useMemo(
    () => invoices.filter((inv) => inv.client_id === clientId),
    [invoices, clientId],
  )

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      client_id: clientId,
      invoice_id: invoiceId === NO_INVOICE ? null : invoiceId,
      amount,
      method,
      paid_at: paidAt || null,
    }
    const res = editing
      ? await updatePaymentAction(payment!.id, payload)
      : await recordPaymentAction(payload)
    setLoading(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success(editing ? 'Payment updated' : 'Payment recorded')
    setOpen(false)
    if (!editing) setAmount('')
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Wallet className="h-4 w-4" /> Record payment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit payment' : 'Record payment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {!fixedClientId && (
            <div className="space-y-2">
              <Label>Client</Label>
              <Select
                value={clientId}
                onValueChange={(v) => {
                  setClientId(v)
                  setInvoiceId(NO_INVOICE)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!fixedInvoiceId && (
            <div className="space-y-2">
              <Label>Against invoice (optional)</Label>
              <Select value={invoiceId} onValueChange={setInvoiceId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_INVOICE}>No specific invoice</SelectItem>
                  {clientInvoices.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pay-amount">Amount</Label>
              <Input
                id="pay-amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-date">Date</Label>
              <Input id="pay-date" type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : editing ? 'Save changes' : 'Record payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
