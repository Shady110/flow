import { cn } from '@/lib/utils'

const TONES = ['bg-flow-green text-white', 'bg-flow-lime text-flow-green', 'bg-flow-green-light text-white', 'bg-secondary text-flow-green']

/** Initials in a colour picked from the name, so the same person always looks the same. */
export function PersonAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('')
  const tone = TONES[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % TONES.length]
  return (
    <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold', tone, className)}>
      {initials || '?'}
    </span>
  )
}
