import { Toaster } from '@/components/ds/sonner'

// Client-portal shell. Full portal (products, invoices, chat) arrives in Phase 3.
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
      <Toaster richColors position="top-right" />
    </div>
  )
}
