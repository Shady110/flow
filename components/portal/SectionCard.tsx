import Link from 'next/link'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/** A big tappable door into one area: icon, a word, one line, and a badge when it needs the client. */
export function SectionCard({
  href,
  icon: Icon,
  title,
  hint,
  badge,
}: {
  href: string
  icon: LucideIcon
  title: string
  hint: string
  badge?: { text: string; tone: 'todo' | 'good' }
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-32 flex-col justify-between gap-3 rounded-3xl border border-border/60 bg-card p-4 shadow-[var(--shadow-xs)] transition-shadow hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)]/10 text-[var(--brand-ink)]">
          <Icon className="h-6 w-6" />
        </span>
        {badge ? (
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-semibold',
              badge.tone === 'todo' ? 'bg-amber-100 text-amber-900' : 'bg-flow-lime/60 text-flow-green',
            )}
          >
            {badge.text}
          </span>
        ) : (
          <ChevronRight className="mt-1 h-5 w-5 text-muted-foreground rtl:rotate-180" />
        )}
      </div>
      <div>
        <p className="font-display text-lg font-bold leading-tight">{title}</p>
        <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{hint}</p>
      </div>
    </Link>
  )
}
