import { formatMoney } from '@/lib/money'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import type { CheckoutRow } from '@/lib/db/payment-queries'

const TONE = { paid: 'text-success', failed: 'text-destructive', expired: 'text-muted-foreground', created: 'text-warning' } as const
const LABEL = { paid: 'Paid', failed: 'Failed', expired: 'Expired', created: 'Waiting' } as const

/** The last online-payment attempts, so a stuck or failed one is visible. */
export function OnlinePaymentsPanel({ rows }: { rows: CheckoutRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Online payments</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">No online payment attempts yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-6 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {formatMoney(Number(r.amount), r.currency)} · {r.client_name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.invoice_number} · {r.provider} · {new Date(r.created_at).toLocaleString()}
                    {r.status === 'failed' && r.failure_reason ? ` · ${r.failure_reason}` : ''}
                  </p>
                </div>
                <span className={`shrink-0 text-xs font-semibold ${TONE[r.status]}`}>{LABEL[r.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
