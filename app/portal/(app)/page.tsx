import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import {
  Package, ListChecks, CheckCircle2, FileSignature, ClipboardCheck, FileText, ChevronRight, PartyPopper,
  type LucideIcon,
} from 'lucide-react'
import { requireClientContext } from '@/lib/auth/client-session'
import { createClient } from '@/lib/supabase/server'
import { getPlatforms } from '@/lib/db/flow-queries'
import { getContracts } from '@/lib/db/contract-queries'
import { getRequirements } from '@/lib/db/requirement-queries'
import { getInvoices } from '@/lib/db/finance-queries'
import { CLIENT_STAGES } from '@/lib/constants'
import type { Product, Task } from '@/lib/types'
import { StatCard } from '@/components/dashboard/StatCard'
import { ProgressSteps } from '@/components/portal/ProgressSteps'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import { ProductStatusBadge } from '@/components/dashboard/indicators'

interface Todo { href: string; icon: LucideIcon; text: string; urgent?: boolean }

export default async function PortalOverview() {
  const { client, clientUser } = await requireClientContext()
  const [t, tm] = await Promise.all([getTranslations('portal.overview'), getTranslations('internal.marketplace')])
  const supabase = await createClient()

  const [{ data: products }, { data: tasks }, platforms, contracts, docs, invoices] = await Promise.all([
    supabase.from('products').select('*').eq('client_id', client.id).order('updated_at', { ascending: false }),
    supabase.from('tasks').select('*').eq('client_id', client.id),
    getPlatforms(client.id),
    getContracts(client.id),
    getRequirements(client.id, { kind: 'client_document' }),
    getInvoices(client.id),
  ])

  const productList = (products as Product[]) ?? []
  const taskList = (tasks as Task[]) ?? []
  const openTasks = taskList.filter((t) => t.status !== 'done')
  const live = productList.filter((p) => p.status === 'live').length

  // What the client themselves has to do — the whole point of this page.
  const todos: Todo[] = []
  if (contracts.some((c) => c.status === 'sent')) {
    todos.push({ href: '/contract', icon: FileSignature, text: t('todoContract'), urgent: true })
  }
  const docsOpen = docs.filter((d) => d.required && (d.status === 'pending' || d.status === 'rejected'))
  const rejected = docsOpen.filter((d) => d.status === 'rejected').length
  if (docsOpen.length) {
    todos.push({
      href: '/documents',
      icon: ClipboardCheck,
      text: rejected ? t('todoDocumentsRejected', { count: docsOpen.length, rejected }) : t('todoDocuments', { count: docsOpen.length }),
      urgent: rejected > 0,
    })
  }
  const due = invoices.filter((i) => i.status === 'sent' && i.balance > 0)
  if (due.length) todos.push({ href: '/invoices', icon: FileText, text: t('todoInvoices', { count: due.length }) })

  const stageLabel = (s: string) => t(`stage.${s}`)
  const stageHelp = (s: string) => t(`stageHelp.${s}`)

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {t('welcome', { name: clientUser.full_name.split(' ')[0] })}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Action needed */}
      <section aria-labelledby="todo-title" className="space-y-3">
        <h2 id="todo-title" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('actionNeeded')}
        </h2>
        {todos.length === 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-border bg-flow-lime/20 p-4">
            <PartyPopper className="mt-0.5 h-5 w-5 shrink-0 text-flow-green" />
            <div>
              <p className="font-medium">{t('allSet')}</p>
              <p className="text-sm text-muted-foreground">{t('allSetHelp')}</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => {
              const Icon = todo.icon
              return (
                <li key={todo.href}>
                  <Link
                    href={todo.href}
                    className={`flex min-h-14 items-center gap-3 rounded-xl border p-4 transition-colors hover:border-flow-green ${
                      todo.urgent ? 'border-amber-300 bg-amber-50' : 'border-border bg-card'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0 text-flow-green" />
                    <span className="flex-1 text-sm font-medium">{todo.text}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Where things stand */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t('whereWeAre')}</h2>
        {client.stage !== 'onboarded' ? (
          <Card>
            <CardContent className="p-5">
              <ProgressSteps
                current={client.stage}
                steps={CLIENT_STAGES.map((s) => ({ id: s, label: stageLabel(s), help: stageHelp(s) }))}
              />
            </CardContent>
          </Card>
        ) : platforms.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noPlatforms')}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {platforms.map((p) => (
              <Card key={p.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{tm(p.platform)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressSteps
                    current={p.stage}
                    steps={p.stages.map((s) => ({ id: s, label: stageLabel(s), help: stageHelp(s) }))}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard label={t('products')} value={productList.length} icon={Package} />
        <StatCard label={t('live')} value={live} icon={CheckCircle2} tone="success" />
        <StatCard label={t('openTasks')} value={openTasks.length} icon={ListChecks} />
      </div>

      {/* The header nav covers these on larger screens; the phone tab bar has no room. */}
      <nav aria-label={t('more')} className="space-y-2 sm:hidden">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t('more')}</h2>
        {[
          { href: '/contract', label: t('linkContract') },
          { href: '/products', label: t('linkProducts') },
          { href: '/tasks', label: t('linkTasks') },
        ].map((l) => (
          <Link key={l.href} href={l.href}
            className="flex min-h-12 items-center justify-between rounded-xl border border-border bg-card px-4 text-sm font-medium">
            {l.label}
            <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
          </Link>
        ))}
      </nav>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('recentProducts')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {productList.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">{t('noProducts')}</p>
          ) : (
            <ul className="divide-y divide-border">
              {productList.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
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
