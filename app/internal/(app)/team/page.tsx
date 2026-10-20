import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { getDepartments, getLastSignIns, getTasks, getTeam } from '@/lib/db/queries'
import { requirePermission } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { deadlineState } from '@/lib/deadlines'
import { formatDateTime } from '@/lib/format'
import { levelRank, visibleTeam, type Level } from '@/lib/org'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { AddTeamMemberDialog } from '@/components/team/AddTeamMemberDialog'
import { TeamEditPanel } from '@/components/team/TeamEditPanel'
import { cn } from '@/lib/utils'

const LEVEL_STYLE: Record<Level, string> = {
  head: 'bg-flow-green text-flow-lime',
  lead: 'bg-flow-lime/50 text-flow-green',
  member: 'bg-muted text-muted-foreground',
}

const EVENT_LABEL: Record<string, string> = {
  sign_in: 'Signed in',
  sign_in_failed: 'Failed sign-in',
  wrong_address: 'Wrong address',
  sign_out: 'Signed out',
  password_changed: 'Password changed',
  reset_requested: 'Reset link requested',
  reset_by_admin: 'Password reset by admin',
}

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ dept?: string; edit?: string }> }) {
  const viewer = await requirePermission('team.view')
  const { dept, edit } = await searchParams
  const [tasks, team, departments, lastSignIns, locale, t] = await Promise.all([
    getTasks(),
    getTeam(),
    getDepartments(),
    getLastSignIns(),
    getLocale(),
    getTranslations('internal.team'),
  ])
  const canManage = viewer.permissions.has('users.manage')
  const deptLabel = (key: string | null) => {
    const d = departments.find((x) => x.key === key)
    return d ? (locale === 'ar' ? d.name_ar : d.name_en) : '—'
  }

  // Members see themselves, leads and heads their department, the CEO view everyone.
  const seen = visibleTeam({ id: viewer.id, department_key: viewer.department_key, level: viewer.level, seesAll: viewer.permissions.has('ops.overview') }, team)
  const shown = seen
    .filter((m) => !dept || m.department_key === dept)
    .sort((a, b) => (a.department_key ?? 'zz').localeCompare(b.department_key ?? 'zz') || levelRank(a.level) - levelRank(b.level))

  const open = (id: string) => tasks.filter((x) => x.assignee_ids.includes(id) && x.status !== 'done')
  const counts = (key: string | null) => seen.filter((m) => (key ? m.department_key === key : true)).length

  // The selected person (only people who manage users can edit).
  const selected = canManage && edit ? seen.find((m) => m.id === edit) : undefined
  let panel: React.ReactNode = null
  if (selected) {
    const supabase = await createClient()
    const [{ data: roleRows }, { data: events }, { data: auth }] = await Promise.all([
      supabase.from('roles').select('id, name').order('name'),
      supabase.from('auth_events').select('id, event, created_at').eq('user_id', selected.id).order('created_at', { ascending: false }).limit(5),
      createAdminClient().auth.admin.getUserById(selected.id),
    ])
    panel = (
      <TeamEditPanel
        key={selected.id}
        person={{
          id: selected.id,
          name: selected.full_name ?? '',
          email: auth?.user?.email ?? '',
          department_key: selected.department_key,
          level: selected.level,
          role_id: selected.role_id,
          status: selected.status,
        }}
        departments={departments.map((d) => ({ key: d.key, label: locale === 'ar' ? d.name_ar : d.name_en }))}
        roles={(roleRows ?? []) as { id: string; name: string }[]}
        activity={(events ?? []).map((e) => ({ id: e.id, label: EVENT_LABEL[e.event] ?? e.event, when: formatDateTime(e.created_at, locale) }))}
        closeHref={dept ? `/team?dept=${dept}` : '/team'}
      />
    )
  }

  let addRoles: { id: string; name: string }[] = []
  if (canManage) {
    const { data } = await (await createClient()).from('roles').select('id, name').order('name')
    addRoles = (data ?? []) as { id: string; name: string }[]
  }

  const chip = (key: string | null, label: string) => {
    const active = (dept ?? null) === key
    return (
      <Link
        key={key ?? 'all'}
        href={key ? `/team?dept=${key}` : '/team'}
        className={cn('rounded-full px-4 py-1.5 text-sm font-medium transition-colors', active ? 'bg-flow-green text-flow-lime' : 'border border-border bg-card hover:bg-muted')}
      >
        {label} {counts(key)}
      </Link>
    )
  }
  const href = (id: string) => `/team?${new URLSearchParams({ ...(dept ? { dept } : {}), edit: id })}`

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={canManage ? <AddTeamMemberDialog departments={departments.map((d) => ({ key: d.key, label: locale === 'ar' ? d.name_ar : d.name_en }))} roles={addRoles} /> : undefined}
      />
      <div className="flex flex-wrap gap-2">
        {chip(null, 'All')}
        {departments.map((d) => chip(d.key, locale === 'ar' ? d.name_ar : d.name_en))}
      </div>
      <div className="flex flex-col items-start gap-6 lg:flex-row">
        <div className="w-full min-w-0 flex-1 overflow-x-auto rounded-2xl border border-border bg-card">
          <div className="grid min-w-[640px] grid-cols-[2fr_1.2fr_.8fr_.6fr_.6fr_1.2fr] bg-muted/50 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">
            <div>{t('member')}</div><div>Department</div><div>Level</div><div className="text-end">{t('open')}</div><div className="text-end">{t('overdue')}</div><div className="text-end">Last sign-in</div>
          </div>
          {shown.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">No people here yet.</p>}
          {shown.map((m) => {
            const mine = open(m.id)
            const overdue = mine.filter((x) => deadlineState(x) === 'overdue').length
            const row = (
              <div className={cn('grid min-w-[640px] grid-cols-[2fr_1.2fr_.8fr_.6fr_.6fr_1.2fr] items-center border-t border-border px-5 py-3 text-sm', edit === m.id && 'bg-flow-lime/15', canManage && 'hover:bg-muted/40')}>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-flow-lime/40 text-xs font-bold text-flow-green">{(m.full_name ?? '?').slice(0, 2).toUpperCase()}</span>
                  <div>
                    <p className="font-medium">{m.full_name ?? m.id.slice(0, 6)}{m.status === 'disabled' && <span className="ms-2 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">disabled</span>}</p>
                  </div>
                </div>
                <div>{deptLabel(m.department_key)}</div>
                <div>{m.level ? <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold capitalize', LEVEL_STYLE[m.level])}>{m.level}</span> : '—'}</div>
                <div className="text-end">{mine.length}</div>
                <div className="text-end">{overdue > 0 ? <span className="font-medium text-destructive">{overdue}</span> : 0}</div>
                <div className="text-end text-muted-foreground">{lastSignIns[m.id] ? formatDateTime(lastSignIns[m.id], locale) : canManage ? 'Never' : '—'}</div>
              </div>
            )
            return canManage ? <Link key={m.id} href={href(m.id)} className="block">{row}</Link> : <div key={m.id}>{row}</div>
          })}
        </div>
        {panel}
      </div>
    </div>
  )
}
