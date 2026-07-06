import { notFound } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { getClient, getTasks, getTeam } from '@/lib/db/queries'
import { getCurrentUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { deadlineState } from '@/lib/deadlines'
import type { Product, ClientUser } from '@/lib/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TaskDialog } from '@/components/dashboard/TaskDialog'
import { TaskStatusSelect } from '@/components/dashboard/TaskStatusSelect'
import { ProductDialog } from '@/components/dashboard/ProductDialog'
import { AddClientUserDialog } from '@/components/dashboard/AddClientUserDialog'
import { MessageClientUserButton } from '@/components/dashboard/MessageClientUserButton'
import {
  ClientStatusBadge,
  DeadlineIndicator,
  PriorityLabel,
  ProductStatusBadge,
} from '@/components/dashboard/indicators'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import { Button } from '@/components/ds/button'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()
  const [client, tasks, team, user, { data: products }, { data: clientUsers }] = await Promise.all([
    getClient(clientId),
    getTasks(clientId),
    getTeam(),
    getCurrentUser(),
    supabase.from('products').select('*').eq('client_id', clientId).order('updated_at', { ascending: false }),
    supabase.from('client_users').select('*').eq('client_id', clientId).order('created_at'),
  ])
  if (!client) notFound()

  const productList = (products as Product[]) ?? []
  const clientUserList = (clientUsers as ClientUser[]) ?? []
  const memberName = new Map(team.map((m) => [m.id, m.full_name ?? '—']))
  const canCreateTask = !!user?.permissions.has('tasks.create')
  const canEditTask = !!user?.permissions.has('tasks.edit')
  const canManageProducts = !!user?.permissions.has('products.manage')
  const canEditClient = !!user?.permissions.has('clients.edit')
  const canChat = !!user?.permissions.has('chat.access')

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000'
  const portalProtocol = rootDomain.includes('localhost') ? 'http' : 'https'
  const portalUrl = `${portalProtocol}://${client.slug}.${rootDomain}`

  const open = tasks.filter((t) => t.status !== 'done')
  const overdue = open.filter((t) => deadlineState(t) === 'overdue').length
  const clientOptions = [{ id: client.id, label: client.name }]
  const teamOptions = team.map((m) => ({ id: m.id, label: m.full_name ?? m.id }))

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.name}
        description={`${client.slug}.flow…`}
        actions={
          canCreateTask ? (
            <TaskDialog clients={clientOptions} team={teamOptions} fixedClientId={client.id} />
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <ClientStatusBadge status={client.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Open tasks</p>
            <p className="mt-1 font-display text-xl font-bold">{open.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Overdue</p>
            <p className={`mt-1 font-display text-xl font-bold ${overdue ? 'text-destructive' : ''}`}>{overdue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Portal</p>
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-flow-green"
            >
              Visit <ArrowUpRight className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions &amp; tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.length === 0 && (
            <p className="text-sm text-muted-foreground">No tasks yet for this client.</p>
          )}
          {tasks.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{t.title}</span>
                  <PriorityLabel priority={t.priority} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.next_step ? `Next: ${t.next_step}` : t.stage ?? 'No next step set'}
                  {' · '}
                  {memberName.get(t.assignee_id ?? '') ?? 'Unassigned'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <DeadlineIndicator dueDate={t.due_date} status={t.status} />
                {canEditTask ? (
                  <TaskStatusSelect taskId={t.id} clientId={client.id} status={t.status} />
                ) : null}
                {canEditTask && (
                  <TaskDialog
                    clients={clientOptions}
                    team={teamOptions}
                    fixedClientId={client.id}
                    task={t}
                    trigger={
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Products</CardTitle>
          {canManageProducts && <ProductDialog clientId={client.id} />}
        </CardHeader>
        <CardContent className="space-y-2">
          {productList.length === 0 && (
            <p className="text-sm text-muted-foreground">No products yet.</p>
          )}
          {productList.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[p.sku, p.marketplace].filter(Boolean).join(' · ') || '—'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ProductStatusBadge status={p.status} />
                {canManageProducts && (
                  <ProductDialog
                    clientId={client.id}
                    product={p}
                    trigger={
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Portal users */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Portal users</CardTitle>
          {canEditClient && <AddClientUserDialog clientId={client.id} />}
        </CardHeader>
        <CardContent className="space-y-2">
          {clientUserList.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No portal users yet. Add one to give this client access to their dashboard.
            </p>
          )}
          {clientUserList.map((cu) => (
            <div
              key={cu.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{cu.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {cu.email}
                  {cu.role_at_company ? ` · ${cu.role_at_company}` : ''}
                </p>
              </div>
              {canChat && <MessageClientUserButton clientUserId={cu.id} clientId={client.id} />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
