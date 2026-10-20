import { getLocale } from 'next-intl/server'
import { Toaster } from '@/components/ds/sonner'

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
