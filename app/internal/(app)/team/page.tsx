import { getTranslations } from 'next-intl/server'
import { getTasks, getTeam } from '@/lib/db/queries'
import { requirePermission } from '@/lib/auth/session'
import { deadlineState } from '@/lib/deadlines'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { GroupedBars } from '@/components/dashboard/charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ds/table'

function onTime(completedAt: string | null, dueDate: string | null) {
  if (!completedAt || !dueDate) return true
  return new Date(completedAt) <= new Date(`${dueDate}T23:59:59`)
}

export default async function TeamPage() {
  await requirePermission('team.view')
  const [tasks, team, t] = await Promise.all([
    getTasks(),
    getTeam(),
    getTranslations('internal.team'),
  ])

  const rows = team.map((m) => {
    const mine = tasks.filter((t) => t.assignee_id === m.id)
    const done = mine.filter((t) => t.status === 'done')
    const open = mine.filter((t) => t.status !== 'done')
    const overdue = open.filter((t) => deadlineState(t) === 'overdue')
    const onTimeCount = done.filter((t) => onTime(t.completed_at, t.due_date)).length
    const onTimeRate = done.length ? Math.round((onTimeCount / done.length) * 100) : null
    return {
      id: m.id,
      name: m.full_name ?? m.id.slice(0, 6),
      role: m.role_name,
      open: open.length,
      done: done.length,
      overdue: overdue.length,
      onTimeRate,
    }
  })

  const chartData = rows.map((r) => ({
    name: r.name.split(' ')[0],
    Open: r.open,
    Done: r.done,
    Overdue: r.overdue,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('workload')}</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupedBars
            data={chartData}
            bars={[
              { key: 'Open', color: 'var(--chart-1)', label: t('open') },
              { key: 'Done', color: 'var(--chart-2)', label: t('done') },
              { key: 'Overdue', color: 'var(--destructive)', label: t('overdue') },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('member')}</TableHead>
              <TableHead>{t('role')}</TableHead>
              <TableHead className="text-end">{t('open')}</TableHead>
              <TableHead className="text-end">{t('completed')}</TableHead>
              <TableHead className="text-end">{t('overdue')}</TableHead>
              <TableHead className="text-end">{t('onTime')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="capitalize text-muted-foreground">{r.role ?? '—'}</TableCell>
                <TableCell className="text-end">{r.open}</TableCell>
                <TableCell className="text-end">{r.done}</TableCell>
                <TableCell className="text-end">
                  {r.overdue > 0 ? <span className="font-medium text-destructive">{r.overdue}</span> : 0}
                </TableCell>
                <TableCell className="text-end">
                  {r.onTimeRate === null ? '—' : `${r.onTimeRate}%`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
