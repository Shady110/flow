import { Sparkles } from 'lucide-react'
import { requirePermission } from '@/lib/auth/session'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ComingSoon } from '@/components/dashboard/ComingSoon'

export default async function AutomationsPage() {
  await requirePermission('automation.run')
  return (
    <div className="space-y-6">
      <PageHeader title="Automations" description="AI-assisted listing & image production." />
      <ComingSoon
        icon={Sparkles}
        title="Listing & image automation"
        description="Convert raw product sheets into marketplace-ready listings for Amazon, Noon & Jumia, and turn product photos into clean white-background assets."
        phase="Phase 5"
      />
    </div>
  )
}
