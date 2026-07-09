import { requirePermission } from '@/lib/auth/session'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ListingWizard } from '@/components/automation/ListingWizard'

export default async function NewListingJobPage() {
  await requirePermission('automation.run')
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Listing automation"
        description="Upload a product sheet, map the columns, and generate marketplace-ready listings."
      />
      <ListingWizard />
    </div>
  )
}
