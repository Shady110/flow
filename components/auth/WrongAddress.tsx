import { getTranslations } from 'next-intl/server'
import { TriangleAlert } from 'lucide-react'
import { signOut } from '@/lib/auth/actions'
import { portalOrigin } from '@/lib/tenant'
import { PRODUCT } from '@/lib/product'
import { Button } from '@/components/ds/button'

/** Shown instead of a redirect loop when a team login opens the client address, or the reverse. */
export async function WrongAddress({ portal }: { portal: 'internal' | 'client' }) {
  const t = await getTranslations('auth.wrong')
  const other = portal === 'internal' ? 'client' : 'internal'
  const address = portalOrigin(other, process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000')
  const key = portal === 'internal' ? 'clientOnStaff' : 'staffOnClient'
  return (
    <div className="space-y-5">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
        <TriangleAlert className="h-7 w-7" />
      </span>
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{t(`${key}.title`)}</h1>
        <p className="mt-2 text-base text-muted-foreground">{t(`${key}.text`)}</p>
      </div>
      <p dir="ltr" className="rounded-xl bg-muted px-4 py-3 text-sm">{address.replace(/^https?:\/\//, '')}</p>
      <Button asChild size="lg" className="h-14 w-full text-base">
        <a href={address}>{t('open', { product: PRODUCT[other].name })}</a>
      </Button>
      <form action={signOut}>
        <Button type="submit" variant="outline" size="lg" className="h-12 w-full">{t('signOut')}</Button>
      </form>
    </div>
  )
}
