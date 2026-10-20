import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, FileText } from 'lucide-react'
import { getClient, getTasks, getTeam } from '@/lib/db/queries'
import { getInvoices } from '@/lib/db/finance-queries'
import { getPlatforms, getStageEvents } from '@/lib/db/flow-queries'
import { PageTabs } from '@/components/dashboard/PageTabs'
import { ClientFlowCard } from '@/components/flow/ClientFlowCard'
import { getContracts } from '@/lib/db/contract-queries'
import { ContractStatusBadge } from '@/components/contracts/ContractStatusBadge'
import { ClientRequirementsCard } from '@/components/flow/ClientRequirementsCard'
import { getRequirements, getTemplates } from '@/lib/db/requirement-queries'
import { getTranslations } from 'next-intl/server'
import { getCurrentUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { deadlineState } from '@/lib/deadlines'
import { formatMoney } from '@/lib/money'
import type { Product, ClientUser } from '@/lib/types'
import { deleteClientAction } from '@/lib/db/client-actions'
import { deleteTaskAction } from '@/lib/db/task-actions'
import { deleteProductAction } from '@/lib/db/product-actions'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ConfirmDelete } from '@/components/dashboard/ConfirmDelete'
import { TaskDialog } from '@/components/dashboard/TaskDialog'
import { TaskStatusSelect } from '@/components/dashboard/TaskStatusSelect'
import { ProductDialog } from '@/components/dashboard/ProductDialog'
import { AddClientUserDialog } from '@/components/dashboard/AddClientUserDialog'
import { EditClientUserDialog } from '@/components/dashboard/EditClientUserDialog'
import { deleteClientUserAction } from '@/lib/db/client-user-actions'
import { MessageClientUserButton } from '@/components/dashboard/MessageClientUserButton'
import { NewInvoiceDialog } from '@/components/dashboard/NewInvoiceDialog'
import { RecordPaymentDialog } from '@/components/dashboard/RecordPaymentDialog'
import {
  ClientStatusBadge,
  DeadlineIndicator,
  PriorityLabel,
  ProductStatusBadge,
  InvoiceStatusBadge,
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
  const tct = await getTranslations('internal.contracts')
  const [client, tasks, team, user, t, tt, tc, { data: products }, { data: clientUsers }, platforms, stageEvents, requirements, templates] = await Promise.all([
    getClient(clientId),
    getTasks(clientId, { parentOnly: true }),
    getTeam(),
    getCurrentUser(),
    getTranslations('internal.clientDetail'),
    getTranslations('internal.taskDetail'),
    getTranslations('internal.common'),
    supabase.from('products').select('*').eq('client_id', clientId).order('updated_at', { ascending: false }),
    supabase.from('client_users').select('*').eq('client_id', clientId).order('created_at'),
    getPlatforms(clientId),
    getStageEvents(clientId),
    getRequirements(clientId),
    getTemplates(),
  ])
  if (!client) notFound()

  const contracts = user?.permissions.has('contracts.manage') ? await getContracts(clientId) : []
  const invoices = user?.permissions.has('finance.view') ? await getInvoices(clientId) : []

  const productList = (products as Product[]) ?? []
  const clientUserList = (clientUsers as ClientUser[]) ?? []
  const memberName = new Map(team.map((m) => [m.id, m.full_name ?? '—']))
  const canCreateTask = !!user?.permissions.has('tasks.create')
  const canEditTask = !!user?.permissions.has('tasks.edit')
  const canManageProducts = !!user?.permissions.has('products.manage')
  const canEditClient = !!user?.permissions.has('clients.edit')
  const canDeleteClient = !!user?.permissions.has('clients.delete')
  const canDeleteTask = !!user?.permissions.has('tasks.delete')
  const canChat = !!user?.permissions.has('chat.access')
  const canViewFinance = !!user?.permissions.has('finance.view')
  const canIssueInvoice = !!user?.permissions.has('invoices.issue')
  const canManageFinance = !!user?.permissions.has('finance.manage')

  const balanceOwed = invoices
    .filter((i) => i.status === 'sent' || i.status === 'paid')
    .reduce((s, i) => s + i.balance, 0)
  const invoiceOptions = invoices
    .filter((i) => i.balance > 0 && i.status !== 'void')
    .map((i) => ({ id: i.id, client_id: i.client_id, label: `${i.number} · ${formatMoney(i.balance, i.currency)} due` }))

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000'
  const portalProtocol = rootDomain.includes('localhost') ? 'http' : 'https'
  const portalUrl = `${portalProtocol}://${client.slug}.${rootDomain}`

  const open = tasks.filter((task) => task.status !== 'done')
  const overdue = open.filter((task) => deadlineState(task) === 'overdue').length
  const clientOptions = [{ id: client.id, label: client.name }]
  const teamOptions = team.map((m) => ({ id: m.id, label: m.full_name ?? m.id }))

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.name}
        description={`${client.slug}.flow…`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canIssueInvoice && (
              <NewInvoiceDialog
                clients={clientOptions}
                fixedClientId={client.id}
                trigger={
                  <Button variant="outline">
                    <FileText className="h-4 w-4" /> {t('newInvoice')}
                  </Button>
                }
              />
            )}
            {canCreateTask && (
              <TaskDialog clients={clientOptions} team={teamOptions} fixedClientId={client.id} />
            )}
            {canDeleteClient && (
              <ConfirmDelete
                action={deleteClientAction}
                args={[client.id]}
                title={t('deleteClientTitle', { name: client.name })}
                description={t('deleteClientDesc')}
                label={t('deleteClient')}
                confirmLabel={t('deleteEverything')}
                successMessage={t('clientDeleted')}
                redirectTo="/clients"
              />
            )}
          </div>
        }
      />

      <PageTabs
        tabs={[
          { value: 'overview', label: t('tabOverview'), content: (
            <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t('status')}</p>
            <div className="mt-1">
              <ClientStatusBadge status={client.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t('openTasks')}</p>
            <p className="mt-1 font-display text-xl font-bold">{open.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t('overdue')}</p>
            <p className={`mt-1 font-display text-xl font-bold ${overdue ? 'text-destructive' : ''}`}>{overdue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t('portal')}</p>
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-flow-green"
            >
              {t('visit')} <ArrowUpRight className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>
      </div>

      <ClientFlowCard
        client={client}
        platforms={platforms}
        events={stageEvents}
        team={teamOptions}
        canManage={!!user?.permissions.has('pipeline.manage')}
      />

            </div>
          ) },
          { value: 'papers', label: t('tabPapers'), content: (
            <div className="space-y-6">
      <ClientRequirementsCard
        clientId={client.id}
        requirements={requirements}
        platforms={platforms}
        templates={templates}
        canManage={!!user?.permissions.has('requirements.manage')}
      />

      {user?.permissions.has('contracts.manage') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('contracts')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contracts.length === 0 && <p className="text-sm text-muted-foreground">{t('noContracts')}</p>}
            {contracts.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/contracts/${c.id}`} className="text-sm font-medium hover:underline">{c.title}</Link>
                <ContractStatusBadge status={c.status} label={tct(`status_${c.status}`)} />
              </div>
            ))}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/contracts/new?client=${client.id}`}>{t('newContract')}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

            </div>
          ) },
          { value: 'work', label: t('tabWork'), content: (
            <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('actionsAndTasks')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('noTasksForClient')}</p>
          )}
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Link href={`/tasks/${task.id}`} className="font-medium text-foreground hover:underline">
                    {task.title}
                  </Link>
                  <PriorityLabel priority={task.priority} />
                  {task.subtask_total > 0 && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {task.subtask_done}/{task.subtask_total}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {task.next_step ? t('next', { step: task.next_step }) : (task.stage ?? t('noNextStep'))}
                  {' · '}
                  {task.assignee_ids.length === 0
                    ? tc('unassigned')
                    : task.assignee_ids.map((id) => memberName.get(id) ?? '—').join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <DeadlineIndicator dueDate={task.due_date} status={task.status} />
                {canEditTask ? (
                  <TaskStatusSelect taskId={task.id} clientId={client.id} status={task.status} />
                ) : null}
                {canEditTask && (
                  <TaskDialog
                    clients={clientOptions}
                    team={teamOptions}
                    fixedClientId={client.id}
                    task={task}
                    trigger={
                      <Button variant="ghost" size="sm">
                        {tc('edit')}
                      </Button>
                    }
                  />
                )}
                {canDeleteTask && (
                  <ConfirmDelete
                    action={deleteTaskAction}
                    args={[task.id, client.id]}
                    title={tt('deleteTitle', { title: task.title })}
                    description={
                      task.subtask_total > 0
                        ? tt('deleteWithSubtasks', { count: task.subtask_total })
                        : undefined
                    }
                    successMessage={tt('taskDeleted')}
                    compact
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
          <CardTitle className="text-base">{t('products')}</CardTitle>
          {canManageProducts && <ProductDialog clientId={client.id} />}
        </CardHeader>
        <CardContent className="space-y-2">
          {productList.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('noProducts')}</p>
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
                        {tc('edit')}
                      </Button>
                    }
                  />
                )}
                {canManageProducts && (
                  <ConfirmDelete
                    action={deleteProductAction}
                    args={[p.id, client.id]}
                    title={tt('deleteTitle', { title: p.name })}
                    successMessage={t('productDeleted')}
                    compact
                  />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

            </div>
          ) },
          ...(canViewFinance ? [{ value: 'money', label: t('tabMoney'), content: (
            <div className="space-y-6">
      {/* Finance */}
      {canViewFinance && (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Finance</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Balance owed:{' '}
                <span className={balanceOwed > 0 ? 'font-medium text-warning' : 'text-muted-foreground'}>
                  {formatMoney(balanceOwed)}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {canManageFinance && (
                <RecordPaymentDialog
                  clients={[{ id: client.id, label: client.name }]}
                  invoices={invoiceOptions}
                  fixedClientId={client.id}
                  trigger={
                    <Button variant="ghost" size="sm">
                      Record payment
                    </Button>
                  }
                />
              )}
              {canIssueInvoice && (
                <NewInvoiceDialog
                  clients={[{ id: client.id, label: client.name }]}
                  fixedClientId={client.id}
                  trigger={
                    <Button variant="outline" size="sm">
                      {t('newInvoice')}
                    </Button>
                  }
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {invoices.length === 0 && (
              <p className="text-sm text-muted-foreground">{t('noInvoices')}</p>
            )}
            {invoices.map((i) => (
              <Link
                key={i.id}
                href={`/finance/invoices/${i.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{i.number}</span>
                  <InvoiceStatusBadge status={i.status} />
                </div>
                <div className="text-end text-sm">
                  <span className="tabular-nums">{formatMoney(i.total, i.currency)}</span>
                  {i.balance > 0 && (
                    <span className="ms-2 text-xs text-warning">{formatMoney(i.balance, i.currency)} {t('due')}</span>
                  )}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

            </div>
          ) }] : []),
          { value: 'people', label: t('tabPeople'), content: (
            <div className="space-y-6">
      {/* Portal users */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{t('portalUsers')}</CardTitle>
          {canEditClient && <AddClientUserDialog clientId={client.id} />}
        </CardHeader>
        <CardContent className="space-y-2.5">
          {clientUserList.length === 0 && (
            <p className="py-2 text-sm text-muted-foreground">
              {t('noPortalUsers')}
            </p>
          )}
          {clientUserList.map((cu) => {
            const initials = cu.full_name
              .split(/\s+/)
              .slice(0, 2)
              .map((s) => s[0]?.toUpperCase() ?? '')
              .join('')
            return (
              <div
                key={cu.id}
                className="flex items-center gap-3 rounded-xl border border-border p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {cu.full_name}
                    {cu.status === 'disabled' && (
                      <span className="ms-2 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                        {t('disabled')}
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {cu.email}
                    {cu.role_at_company ? ` · ${cu.role_at_company}` : ''}
                  </p>
                </div>
                {canChat && <MessageClientUserButton clientUserId={cu.id} clientId={client.id} />}
                {canEditClient && <EditClientUserDialog user={cu} />}
                {canEditClient && (
                  <ConfirmDelete
                    action={deleteClientUserAction}
                    args={[cu.id, client.id, cu.user_id]}
                    title={t('removeUserTitle', { name: cu.full_name })}
                    description={t('removeUserDesc')}
                    successMessage={t('userRemoved')}
                    compact
                  />
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
            </div>
          ) },
        ]}
      />
    </div>
  )
}
