import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ds/card'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = 'default',
  href,
}: {
  label: string
  value: string | number
  icon?: LucideIcon
  hint?: string
  tone?: 'default' | 'warning' | 'danger' | 'success'
  /** Makes the whole card a link to the list this number came from. */
  href?: string
}) {
  const toneClasses = {
    default: 'text-foreground',
    warning: 'text-warning',
    danger: 'text-destructive',
    success: 'text-success',
  }[tone]

  const card = (
    <Card className={cn(href && 'transition-shadow hover:shadow-md')}>
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

  return href ? (
    <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {card}
    </Link>
  ) : (
    card
  )
}
