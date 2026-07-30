'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Receipt } from 'lucide-react'
import { toast } from 'sonner'
import { addExpenseAction, updateExpenseAction } from '@/lib/db/finance-actions'
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

const NO_CLIENT = '__none__'

/** The subset of an expense this dialog can edit. */
interface EditableExpense {
  id: string
  client_id: string | null
  category: string | null
  description: string | null
  amount: number
  incurred_on: string
}

export function AddExpenseDialog({
  clients,
  expense,
  trigger,
}: {
  clients: Option[]
  /** Pass an expense to edit it instead of adding a new one. */
  expense?: EditableExpense
  trigger?: React.ReactNode
}) {
  const router = useRouter()
  const editing = !!expense
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clientId, setClientId] = useState(expense?.client_id ?? NO_CLIENT)
  const [category, setCategory] = useState(expense?.category ?? '')
  const [description, setDescription] = useState(expense?.description ?? '')
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '')
  const [incurredOn, setIncurredOn] = useState(expense?.incurred_on?.slice(0, 10) ?? '')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      client_id: clientId === NO_CLIENT ? null : clientId,
      category,
      description,
      amount,
      incurred_on: incurredOn || null,
    }
    const res = editing
      ? await updateExpenseAction(expense!.id, payload)
      : await addExpenseAction(payload)
    setLoading(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success(editing ? 'Expense updated' : 'Expense added')
    setOpen(false)
    if (!editing) {
      setAmount('')
      setDescription('')
      setCategory('')
    }
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Receipt className="h-4 w-4" /> Add expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit expense' : 'Add expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exp-cat">Category</Label>
              <Input id="exp-cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ads, tools…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-amount">Amount</Label>
              <Input
                id="exp-amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp-desc">Description</Label>
            <Input id="exp-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client (optional)</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CLIENT}>General</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-date">Date</Label>
              <Input id="exp-date" type="date" value={incurredOn} onChange={(e) => setIncurredOn(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : editing ? 'Save changes' : 'Add expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
