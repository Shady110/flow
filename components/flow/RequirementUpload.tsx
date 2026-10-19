'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FileDrop } from '@/components/FileDrop'
import { createClient } from '@/lib/supabase/browser'
import { CLIENT_FILES_BUCKET } from '@/lib/constants'
import { getRequirementUploadUrlAction, submitRequirementAction } from '@/lib/db/requirement-actions'

/** Upload straight to storage with a server-signed token, then mark the slot submitted. */
export function RequirementUpload({
  requirementId,
  label,
  done,
}: {
  requirementId: string
  label: string
  done?: string
}) {
  const router = useRouter()
  return (
    <FileDrop
      label={label}
      onFile={async (file) => {
        const urlRes = await getRequirementUploadUrlAction(requirementId, file.name, file.size)
        if (!urlRes.ok) throw new Error(urlRes.error)
        const { error } = await createClient()
          .storage.from(CLIENT_FILES_BUCKET)
          .uploadToSignedUrl(urlRes.path, urlRes.token, file)
        if (error) throw error
        const res = await submitRequirementAction(requirementId, urlRes.path, file.name)
        if (!res.ok) throw new Error(res.error)
        if (done) toast.success(done)
        router.refresh()
      }}
    />
  )
}
