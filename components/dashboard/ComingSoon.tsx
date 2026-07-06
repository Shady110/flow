import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ds/card'

export function ComingSoon({
  icon: Icon,
  title,
  description,
  phase,
}: {
  icon: LucideIcon
  title: string
  description: string
  phase: string
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="rounded-full bg-secondary p-4 text-flow-green">
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {phase}
        </span>
      </CardContent>
    </Card>
  )
}
