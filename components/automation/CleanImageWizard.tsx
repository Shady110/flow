'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadCloud, Loader2, Plus, Trash2, FolderOpen, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/browser'
import { getUploadUrlAction, createImageCleanJobAction } from '@/lib/db/automation-actions'
import { outputKeys } from '@/lib/automation/image-paths'
import { Button } from '@/components/ds/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'

interface Shot {
  id: string
  file: File
  relativePath: string
  url: string
}

/** Above this the browser struggles to hold every thumbnail alive at once. */
const THUMBNAIL_LIMIT = 24
/** Soft warning — the zip is built in one request, so big jobs are riskier. */
const LARGE_JOB = 150

export function CleanImageWizard() {
  const router = useRouter()
  const [shots, setShots] = useState<Shot[]>([])
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const folderRef = useRef<HTMLInputElement>(null)

  function add(fileList: FileList | null) {
    // A directory pick sweeps up everything, so filter to images here rather
    // than trusting the accept attribute.
    const files = Array.from(fileList ?? []).filter((f) => f.type.startsWith('image/'))
    if (files.length === 0) return
    setShots((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        relativePath: file.webkitRelativePath,
        url: URL.createObjectURL(file),
      })),
    ])
  }

  // Group by the folder each image came from, so a folder pick reads as a list
  // of SKUs rather than a wall of files.
  const groups = useMemo(() => {
    const byFolder = new Map<string, Shot[]>()
    for (const s of shots) {
      const folder = s.relativePath.split('/').slice(1, -1).join('/')
      byFolder.set(folder, [...(byFolder.get(folder) ?? []), s])
    }
    return [...byFolder.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [shots])

  async function create() {
    setBusy(true)
    setProgress(0)
    try {
      const supabase = createClient()
      const folder = crypto.randomUUID()
      // Derived up front so collisions resolve against the whole batch.
      const keys = outputKeys(shots.map((s) => ({ name: s.file.name, relativePath: s.relativePath })))
      const images: { name: string; path: string }[] = []

      for (const [i, shot] of shots.entries()) {
        const ext = shot.file.name.split('.').pop() || 'jpg'
        // Input paths are throwaway — only the key matters for the output.
        const urlRes = await getUploadUrlAction(folder, `${i}.${ext}`)
        if (!urlRes.ok) throw new Error(urlRes.error)
        const { error } = await supabase.storage
          .from('automation-inputs')
          .uploadToSignedUrl(urlRes.path, urlRes.token, shot.file)
        if (error) throw error
        images.push({ name: keys[i], path: urlRes.path })
        setProgress(Math.round(((i + 1) / shots.length) * 100))
      }

      const res = await createImageCleanJobAction({ images })
      if (!res.ok) throw new Error(res.error)
      router.push(`/automations/${res.jobId}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border py-14 text-center">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Add product images</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pick a parent folder of SKU subfolders — the zip comes back in the same structure
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => folderRef.current?.click()}>
                <FolderOpen className="h-4 w-4" /> Add folder
              </Button>
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Plus className="h-4 w-4" /> Add images
              </Button>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              add(e.target.files)
              e.target.value = ''
            }}
          />
          <input
            // React's JSX types omit webkitdirectory, but it is a typed property
            // on HTMLInputElement — set it here instead of casting the props.
            ref={(el) => {
              folderRef.current = el
              if (el) el.webkitdirectory = true
            }}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              add(e.target.files)
              e.target.value = ''
            }}
          />
        </CardContent>
      </Card>

      {shots.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">
              {shots.length} image{shots.length === 1 ? '' : 's'}
              {groups.length > 1 && ` across ${groups.length} folders`}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShots([])} disabled={busy}>
              Clear
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="divide-y divide-border rounded-lg border border-border">
              {groups.map(([folder, items]) => (
                <li key={folder || '_root'} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="flex min-w-0 items-center gap-2 text-sm">
                    {folder ? (
                      <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : null}
                    <span className="truncate font-medium">{folder || 'Loose images'}</span>
                  </span>
                  <span className="shrink-0 text-sm text-muted-foreground">{items.length}</span>
                </li>
              ))}
            </ul>

            {shots.length <= THUMBNAIL_LIMIT && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {shots.map((s) => (
                  <div
                    key={s.id}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.url} alt={s.file.name} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      aria-label={`Remove ${s.file.name}`}
                      className="absolute end-1 top-1 rounded-md bg-background/85 p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      onClick={() => {
                        URL.revokeObjectURL(s.url)
                        setShots((prev) => prev.filter((x) => x.id !== s.id))
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {shots.length > LARGE_JOB && (
              <p className="flex items-start gap-2 text-xs text-warning">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Large batch — the zip is assembled in a single request, so very big jobs can time out
                at the final step. Splitting into smaller runs is safer.
              </p>
            )}

            {busy ? (
              <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-flow-green transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading… {progress}%
                </p>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button onClick={create}>
                  Clean up {shots.length} image{shots.length === 1 ? '' : 's'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
