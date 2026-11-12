import type { LucideIcon } from 'lucide-react'

/** Calm "nothing here" block used inside panels and lists. */
export function EmptyState({ icon: Icon, text }: { icon?: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/50 px-4 py-8 text-center">
      {Icon && <Icon className="h-5 w-5 text-flow-green" />}
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}
