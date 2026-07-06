import { Package, ListChecks, CheckCircle2 } from 'lucide-react'
import { requireClientContext } from '@/lib/auth/client-session'
import { createClient } from '@/lib/supabase/server'
import { deadlineState } from '@/lib/deadlines'
import type { Product, Task } from '@/lib/types'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import { ProductStatusBadge } from '@/components/dashboard/indicators'

export default async function PortalOverview() {
  const { client, clientUser } = await requireClientContext()
  const supabase = await createClient()

  const [{ data: products }, { data: tasks }] = await Promise.all([
    supabase.from('products').select('*').eq('client_id', client.id).order('updated_at', { ascending: false }),
    supabase.from('tasks').select('*').eq('client_id', client.id),
  ])

  const productList = (products as Product[]) ?? []
  const taskList = (tasks as Task[]) ?? []
  const openTasks = taskList.filter((t) => t.status !== 'done')
  const live = productList.filter((p) => p.status === 'live').length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Welcome back, {clientUser.full_name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Here&apos;s the latest on your account with FLOW.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Products" value={productList.length} icon={Package} />
        <StatCard label="Live" value={live} icon={CheckCircle2} tone="success" />
        <StatCard label="Open tasks" value={openTasks.length} icon={ListChecks} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {productList.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">No products yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {productList.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-6 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.marketplace ?? '—'}</p>
                  </div>
                  <ProductStatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
