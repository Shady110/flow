import { getTranslations } from 'next-intl/server'
import { Package } from 'lucide-react'
import type { Product, ProductStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const CHIP: Record<ProductStatus, string> = {
  live: 'bg-flow-lime/60 text-flow-green',
  review: 'bg-sky-100 text-sky-900',
  in_progress: 'bg-amber-100 text-amber-900',
  draft: 'bg-muted text-muted-foreground',
  rejected: 'bg-destructive/10 text-destructive',
  paused: 'bg-muted text-muted-foreground',
}

/** Products as cards, with a plain-words status: no table, no horizontal scrolling. */
export async function ProductsView({ products }: { products: Product[] }) {
  const [t, tp, tm] = await Promise.all([
    getTranslations('portal.products'),
    getTranslations('portal.plain'),
    getTranslations('internal.marketplace'),
  ])
  const live = products.filter((p) => p.status === 'live').length
  const market = (m: string | null) => (m && ['amazon', 'noon', 'jumia'].includes(m.toLowerCase()) ? tm(m.toLowerCase()) : m)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-base text-muted-foreground">{products.length ? t('summary', { live, total: products.length }) : t('subtitle')}</p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <Package className="h-10 w-10 text-muted-foreground" />
          <p className="text-base text-muted-foreground">{t('noProducts')}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li key={p.id} className="flex items-center gap-4 rounded-3xl border border-border/60 bg-card p-4 shadow-[var(--shadow-xs)]">
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
              ) : (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)]/10 text-[var(--brand-ink)]">
                  <Package className="h-6 w-6" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold leading-snug">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  {[market(p.marketplace), p.sku].filter(Boolean).join(' · ')}
                </p>
              </div>
              <span className={cn('shrink-0 rounded-full px-3 py-1 text-sm font-semibold', CHIP[p.status])}>{tp(`product.${p.status}`)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
