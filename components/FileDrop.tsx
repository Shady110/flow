'use client'

import { useRef, useState } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ds/button'
import { MAX_UPLOAD_MB } from '@/lib/constants'

/**
 * A button that opens the file picker (on phones: camera / photos / files) and
 * hands the chosen file to `onFile`. Owns the busy state and error toast so
 * callers only write the upload itself. Throwing from `onFile` shows the message.
 */
export function FileDrop({
  label,
  onFile,
  accept = 'image/*,application/pdf',
  disabled,
  variant = 'outline',
}: {
  label: string
  onFile: (file: File) => Promise<void>
  accept?: string
  disabled?: boolean
  variant?: 'outline' | 'default' | 'secondary'
}) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function pick(file: File | undefined) {
    if (!file) return
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      toast.error(`Files can be at most ${MAX_UPLOAD_MB} MB.`)
      return
    }
    setBusy(true)
    try {
      await onFile(file)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      <Button
        type="button"
        size="sm"
        variant={variant}
        disabled={disabled || busy}
        onClick={() => input.current?.click()}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {label}
      </Button>
    </>
  )
}
