import { requireClientContext } from '@/lib/auth/client-session'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'
import { Card } from '@/components/ds/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ds/table'
import { ProductStatusBadge } from '@/components/dashboard/indicators'

export default async function PortalProducts() {
  const { client } = await requireClientContext()
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('client_id', client.id)
    .order('updated_at', { ascending: false })
  const products = (data as Product[]) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Products</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live status of every product we&apos;re working on for you.
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Marketplace</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  No products yet.
                </TableCell>
              </TableRow>
            )}
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.sku ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground">{p.marketplace ?? '—'}</TableCell>
                <TableCell>
                  <ProductStatusBadge status={p.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
