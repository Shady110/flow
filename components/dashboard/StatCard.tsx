import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ds/card'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = 'default',
}: {
  label: string
  value: string | number
  icon?: LucideIcon
  hint?: string
  tone?: 'default' | 'warning' | 'danger' | 'success'
}) {
  const toneClasses = {
    default: 'text-foreground',
    warning: 'text-warning',
    danger: 'text-destructive',
    success: 'text-success',
  }[tone]

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className={cn('mt-2 font-display text-3xl font-bold', toneClasses)}>{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className="rounded-lg bg-secondary p-2 text-flow-green">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
