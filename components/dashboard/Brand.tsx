import { PRODUCT } from '@/lib/product'

/** FLOW wordmark with the product tag (Pro) used on the team dashboard; `compact` is the rail's mark alone. */
export function Brand({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-flow-green font-display text-lg font-bold text-flow-lime">
        F
      </span>
    )
  }
  return (
    <div className="flex items-center gap-2">
      <span className="font-display text-2xl font-bold tracking-tight text-flow-green">FLOW</span>
      <span className="rounded-full bg-flow-lime px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-flow-green">
        {PRODUCT.internal.short}
      </span>
    </div>
  )
}
