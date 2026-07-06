'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createProductAction, updateProductAction } from '@/lib/db/product-actions'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { Textarea } from '@/components/ds/textarea'
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
import { PRODUCT_STATUS_LABELS, type Product, type ProductStatus } from '@/lib/types'

export function ProductDialog({
  clientId,
  product,
  trigger,
}: {
  clientId: string
  product?: Product
  trigger?: React.ReactNode
}) {
  const router = useRouter()
  const editing = !!product
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    marketplace: product?.marketplace ?? '',
    status: (product?.status ?? 'draft') as ProductStatus,
    price: product?.price != null ? String(product.price) : '',
    notes: product?.notes ?? '',
  })

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, client_id: clientId, price: form.price === '' ? null : form.price }
    const res = editing ? await updateProductAction(product!.id, payload) : await createProductAction(payload)
    setLoading(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success(editing ? 'Product updated' : 'Product added')
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" /> Add product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit product' : 'Add product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-sku">SKU</Label>
              <Input id="p-sku" value={form.sku} onChange={(e) => set('sku', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-mp">Marketplace</Label>
              <Input
                id="p-mp"
                value={form.marketplace}
                onChange={(e) => set('marketplace', e.target.value)}
                placeholder="Amazon, Noon…"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v as ProductStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {PRODUCT_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-price">Price</Label>
              <Input
                id="p-price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-notes">Notes</Label>
            <Textarea id="p-notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
