'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadCloud, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/browser'
import { getUploadUrlAction, createImageJobAction } from '@/lib/db/automation-actions'
import { Button } from '@/components/ds/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'

/** Group files by SKU = filename before the last underscore (e.g. SKU123_1.jpg → SKU123). */
function skuOf(filename: string) {
  const base = filename.replace(/\.[^.]+$/, '')
  const i = base.lastIndexOf('_')
  return i > 0 ? base.slice(0, i) : base
}

export function ImageWizard() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)

  const groups = useMemo(() => {
    const map = new Map<string, File[]>()
    for (const f of files) {
      const sku = skuOf(f.name)
      if (!map.has(sku)) map.set(sku, [])
      map.get(sku)!.push(f)
    }
    return [...map.entries()].map(([sku, fs]) => ({ sku, files: fs }))
  }, [files])

  const validGroups = groups.filter((g) => g.files.length >= 2)

  async function create() {
    setBusy(true)
    setProgress(0)
    try {
      const supabase = createClient()
      const folder = crypto.randomUUID()
      const products: { sku: string; paths: string[] }[] = []
      let uploaded = 0
      const totalFiles = validGroups.reduce((s, g) => s + g.files.length, 0)

      for (const group of validGroups) {
        const paths: string[] = []
        for (const file of group.files) {
          const urlRes = await getUploadUrlAction(folder, `${group.sku}/${file.name}`)
          if (!urlRes.ok) throw new Error(urlRes.error)
          const { error } = await supabase.storage
            .from('automation-inputs')
            .uploadToSignedUrl(urlRes.path, urlRes.token, file)
          if (error) throw error
          paths.push(urlRes.path)
          uploaded++
          setProgress(Math.round((uploaded / totalFiles) * 100))
        }
        products.push({ sku: group.sku, paths })
      }

      const res = await createImageJobAction({ products })
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
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-16 text-center transition-colors hover:border-flow-green/40 hover:bg-muted/40">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Upload product photos</p>
              <p className="text-xs text-muted-foreground">
                Name files <code>SKU_1.jpg</code>, <code>SKU_2.jpg</code> — 2+ per product
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
          </label>
        </CardContent>
      </Card>

      {groups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {validGroups.length} product{validGroups.length === 1 ? '' : 's'} ready
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {groups.map((g) => (
              <div key={g.sku} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <span className="font-medium">{g.sku}</span>
                <span className={g.files.length >= 2 ? 'text-muted-foreground' : 'text-warning'}>
                  {g.files.length} image{g.files.length === 1 ? '' : 's'}
                  {g.files.length < 2 && (
                    <AlertTriangle className="ml-1 inline h-3.5 w-3.5" />
                  )}
                </span>
              </div>
            ))}
            {groups.some((g) => g.files.length < 2) && (
              <p className="text-xs text-warning">Products with fewer than 2 images are skipped.</p>
            )}

            {busy ? (
              <div className="space-y-2 pt-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-flow-green transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading… {progress}%
                </p>
              </div>
            ) : (
              <div className="flex justify-end pt-2">
                <Button onClick={create} disabled={validGroups.length === 0}>
                  Generate images for {validGroups.length} product{validGroups.length === 1 ? '' : 's'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
