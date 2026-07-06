import { Toaster } from '@/components/ds/sonner'

// Wraps every internal route (both the login screen and the authed app).
export default function InternalRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
      <Toaster richColors position="top-right" />
    </div>
  )
}
