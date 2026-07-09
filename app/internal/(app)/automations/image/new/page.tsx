import { requirePermission } from '@/lib/auth/session'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ImageWizard } from '@/components/automation/ImageWizard'

export default async function NewImageJobPage() {
  await requirePermission('automation.run')
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Image automation"
        description="Upload product photos and get clean white-background front, side & back shots."
      />
      <ImageWizard />
    </div>
  )
}
