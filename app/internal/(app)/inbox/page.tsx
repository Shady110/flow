import Link from 'next/link'
import { requirePermission } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card } from '@/components/ds/card'

interface ConvRow {
  id: string
  subject: string | null
  last_message_at: string | null
  client: { name: string } | { name: string }[] | null
  client_user: { full_name: string; email: string } | { full_name: string; email: string }[] | null
}

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v
}

export default async function InboxPage() {
  await requirePermission('chat.access')
  const supabase = await createClient()
  const { data } = await supabase
    .from('conversations')
    .select('id, subject, last_message_at, client:clients(name), client_user:client_users(full_name, email)')
    .order('last_message_at', { ascending: false, nullsFirst: false })

  const rows = (data as ConvRow[]) ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Inbox" description="Private conversations with client contacts." />

      <Card>
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No conversations yet. Start one from a client&apos;s page.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r) => {
              const cu = one(r.client_user)
              const cl = one(r.client)
              const name = cu?.full_name ?? 'Unknown'
              const initials = name
                .split(/\s+/)
                .slice(0, 2)
                .map((s) => s[0]?.toUpperCase() ?? '')
                .join('')
              return (
                <li key={r.id}>
                  <Link
                    href={`/inbox/${r.id}`}
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                      {initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{name}</p>
                      <p className="truncate text-xs text-muted-foreground">{cl?.name}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {r.last_message_at
                        ? new Date(r.last_message_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'New'}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
