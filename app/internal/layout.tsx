import type { Metadata } from 'next'
import { PRODUCT } from '@/lib/product'
import { AreaMessages } from '@/i18n/area-messages'
import { Toaster } from '@/components/ds/sonner'

export const metadata: Metadata = {
  title: { default: PRODUCT.internal.name, template: `%s · ${PRODUCT.internal.name}` },
}

// Wraps every internal route (both the login screen and the authed app).
export default async function InternalRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AreaMessages namespaces={['common', 'internal', 'auth', 'chat', 'invoiceDoc', 'notifications']}>
      <div className="min-h-screen bg-background text-foreground">
        {children}
        <Toaster richColors position="top-right" />
      </div>
    </AreaMessages>
  )
}
