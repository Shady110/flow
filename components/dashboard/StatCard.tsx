import Link from 'next/link'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ds/card'
import { cn } from '@/lib/utils'

/**
 * One headline number. `variant="hero"` is the dark-green lead card; `href`
 * makes the whole card a link to the list the number came from, with a round
 * arrow in the corner. `chip` is the small coloured note under the number.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  chip,
  tone = 'default',
  href,
  variant = 'default',
  className,
}: {
  label: string
  value: string | number
  icon?: LucideIcon
  hint?: string
  chip?: { text: string; tone?: 'good' | 'bad' | 'warn' | 'neutral' }
  tone?: 'default' | 'warning' | 'danger' | 'success'
  href?: string
  variant?: 'default' | 'hero'
  className?: string
}) {
  const hero = variant === 'hero'
  const valueTone = hero
    ? 'text-white'
    : { default: 'text-foreground', warning: 'text-warning', danger: 'text-destructive', success: 'text-success' }[tone]
  const chipTone = {
    good: hero ? 'bg-flow-lime/20 text-flow-lime' : 'bg-flow-lime/60 text-flow-green',
    bad: 'bg-destructive/10 text-destructive',
    warn: 'bg-warning/15 text-warning',
    neutral: hero ? 'bg-white/10 text-white/80' : 'bg-muted text-muted-foreground',
  }

  const card = (
    <Card
      className={cn(
        'h-full gap-0 p-4 sm:p-5',
        hero && 'border-transparent text-white shadow-[var(--shadow-md)]',
        href && 'transition-shadow hover:shadow-[var(--shadow-md)]',
        // With a link, the grid item is the <Link>; it carries the layout classes instead.
        !href && className,
      )}
      style={hero ? { background: 'var(--gradient-dark-panel)' } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={cn('flex items-center gap-2 text-sm font-medium', hero ? 'text-white/80' : 'text-muted-foreground')}>
          {Icon && <Icon className="h-4 w-4 shrink-0" />}
          {label}
        </p>
        {href && (
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
              hero ? 'border-transparent bg-white text-flow-green' : 'border-border bg-card text-foreground',
            )}
          >
            <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
          </span>
        )}
      </div>
      <p className={cn('mt-3 font-display text-4xl font-bold leading-none tracking-tight sm:mt-4 sm:text-5xl', valueTone)}>
        {/* Isolate the number so "7 / 10" doesn't flip to "10 / 7" in RTL. */}
        <bdi dir="ltr">{value}</bdi>
      </p>
      {(chip || hint) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {chip && (
            <span className={cn('rounded-md px-1.5 py-0.5 font-medium', chipTone[chip.tone ?? 'neutral'])}>
              {chip.text}
            </span>
          )}
          {hint && <span className={hero ? 'text-white/70' : 'text-muted-foreground'}>{hint}</span>}
        </div>
      )}
    </Card>
  )

  return href ? (
    <Link href={href} className={cn('block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}>
      {card}
    </Link>
  ) : (
    card
  )
}
