import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { PRODUCT } from '@/lib/product'
import { Toaster } from '@/components/ds/sonner'

export const metadata: Metadata = {
  title: { default: PRODUCT.client.name, template: `%s · ${PRODUCT.client.name}` },
}

// Client-portal shell. Toasts appear on the reading-start side.
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const rtl = (await getLocale()) === 'ar'
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
      <Toaster richColors position={rtl ? 'top-left' : 'top-right'} />
    </div>
  )
}
