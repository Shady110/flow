'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadCloud, Loader2, AlertTriangle, Plus, Trash2, ImagePlus } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/browser'
import { getUploadUrlAction, createImageJobAction } from '@/lib/db/automation-actions'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'

interface Product {
  id: string
  sku: string
  files: File[]
}

function sanitizeSku(s: string) {
  return s.trim().replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-') || 'product'
}

export function ImageWizard() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const addRef = useRef<HTMLInputElement>(null)

  function addProduct(fileList: FileList | null) {
    const files = Array.from(fileList ?? [])
    if (files.length === 0) return
    setProducts((prev) => [
      ...prev,
      { id: crypto.randomUUID(), sku: `product-${prev.length + 1}`, files },
    ])
  }

  function addImagesTo(id: string, fileList: FileList | null) {
    const files = Array.from(fileList ?? [])
    if (files.length === 0) return
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, files: [...p.files, ...files] } : p)))
  }

  const validCount = products.filter((p) => p.files.length >= 2).length

  async function create() {
    setBusy(true)
    setProgress(0)
    try {
      const supabase = createClient()
      const folder = crypto.randomUUID()
      const valid = products.filter((p) => p.files.length >= 2)
      const payload: { sku: string; paths: string[] }[] = []
      const totalFiles = valid.reduce((s, p) => s + p.files.length, 0)
      let uploaded = 0

      for (const product of valid) {
        const sku = sanitizeSku(product.sku)
        const paths: string[] = []
        for (const [i, file] of product.files.entries()) {
          const ext = file.name.split('.').pop() || 'jpg'
          const urlRes = await getUploadUrlAction(folder, `${sku}_src${i}.${ext}`)
          if (!urlRes.ok) throw new Error(urlRes.error)
          const { error } = await supabase.storage
            .from('automation-inputs')
            .uploadToSignedUrl(urlRes.path, urlRes.token, file)
          if (error) throw error
          paths.push(urlRes.path)
          uploaded++
          setProgress(Math.round((uploaded / totalFiles) * 100))
        }
        payload.push({ sku, paths })
      }

      const res = await createImageJobAction({ products: payload })
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
          <button
            type="button"
            onClick={() => addRef.current?.click()}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-16 text-center transition-colors hover:border-flow-green/40 hover:bg-muted/40"
          >
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Add a product</p>
              <p className="text-xs text-muted-foreground">
                Select its 2+ angle photos together — one product per selection
              </p>
            </div>
          </button>
          <input
            ref={addRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              addProduct(e.target.files)
              e.target.value = ''
            }}
          />
        </CardContent>
      </Card>

      {products.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">
              {validCount} product{validCount === 1 ? '' : 's'} ready
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => addRef.current?.click()}>
              <Plus className="h-4 w-4" /> Add product
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Input
                  value={p.sku}
                  onChange={(e) =>
                    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, sku: e.target.value } : x)))
                  }
                  className="h-9 max-w-[220px]"
                  placeholder="SKU / product name"
                />
                <span
                  className={`flex items-center gap-1 text-sm ${p.files.length >= 2 ? 'text-muted-foreground' : 'text-warning'}`}
                >
                  {p.files.length} image{p.files.length === 1 ? '' : 's'}
                  {p.files.length < 2 && <AlertTriangle className="h-3.5 w-3.5" />}
                </span>
                <label className="cursor-pointer text-muted-foreground hover:text-foreground" title="Add more images">
                  <ImagePlus className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addImagesTo(p.id, e.target.files)
                      e.target.value = ''
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="ml-auto text-muted-foreground hover:text-destructive"
                  onClick={() => setProducts((prev) => prev.filter((x) => x.id !== p.id))}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            {products.some((p) => p.files.length < 2) && (
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
                <Button onClick={create} disabled={validCount === 0}>
                  Generate images for {validCount} product{validCount === 1 ? '' : 's'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
