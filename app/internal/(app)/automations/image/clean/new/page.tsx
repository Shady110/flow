import { requirePermission } from '@/lib/auth/session'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { CleanImageWizard } from '@/components/automation/CleanImageWizard'

export default async function NewCleanImageJobPage() {
  await requirePermission('automation.run')
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Clean up images"
        description="Upload a batch of product photos and get them back on a pure white background — shadows removed, product straightened and centred."
      />
      <CleanImageWizard />
    </div>
  )
}
