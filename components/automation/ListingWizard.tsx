'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadCloud, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/browser'
import {
  getUploadUrlAction,
  parseSheetAction,
  createListingJobAction,
} from '@/lib/db/automation-actions'
import {
  MARKETPLACES,
  CANONICAL_FIELDS,
  CANONICAL_LABELS,
  type CanonicalKey,
} from '@/lib/automation/marketplaces'
import { Button } from '@/components/ds/button'
import { Label } from '@/components/ds/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ds/select'

const NONE = '__none__'

/** Best-effort auto-map of canonical fields to sheet headers by fuzzy name match. */
function autoMap(headers: string[]): Partial<Record<CanonicalKey, string>> {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const synonyms: Record<CanonicalKey, string[]> = {
    sku: ['sku', 'id', 'code', 'itemid'],
    name: ['name', 'title', 'product'],
    brand: ['brand', 'manufacturer'],
    category: ['category', 'type'],
    price: ['price', 'cost', 'msrp'],
    color: ['color', 'colour'],
    material: ['material', 'fabric'],
    dimensions: ['dimension', 'size', 'measurement'],
    weight: ['weight', 'mass'],
    notes: ['notes', 'features', 'description', 'details'],
  }
  const map: Partial<Record<CanonicalKey, string>> = {}
  for (const key of CANONICAL_FIELDS) {
    const hit = headers.find((h) => synonyms[key].some((s) => norm(h).includes(s)))
    if (hit) map[key] = hit
  }
  return map
}

export function ListingWizard() {
  const router = useRouter()
  const [step, setStep] = useState<'upload' | 'map'>('upload')
  const [busy, setBusy] = useState(false)
  const [path, setPath] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [marketplace, setMarketplace] = useState(MARKETPLACES[0].key)
  const [mapping, setMapping] = useState<Partial<Record<CanonicalKey, string>>>({})

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const folder = crypto.randomUUID()
      const urlRes = await getUploadUrlAction(folder, file.name)
      if (!urlRes.ok) throw new Error(urlRes.error)

      const supabase = createClient()
      const { error } = await supabase.storage
        .from('automation-inputs')
        .uploadToSignedUrl(urlRes.path, urlRes.token, file)
      if (error) throw error

      const parsed = await parseSheetAction(urlRes.path)
      if (!parsed.ok) throw new Error(parsed.error)

      setPath(urlRes.path)
      setHeaders(parsed.headers)
      setRowCount(parsed.rowCount)
      setMapping(autoMap(parsed.headers))
      setStep('map')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  async function create() {
    if (!mapping.sku) {
      toast.error('Map at least the SKU column.')
      return
    }
    setBusy(true)
    const res = await createListingJobAction({ inputPath: path, marketplace, mapping })
    setBusy(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    router.push(`/automations/${res.jobId}`)
  }

  if (step === 'upload') {
    return (
      <Card>
        <CardContent className="p-8">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-16 text-center transition-colors hover:border-flow-green/40 hover:bg-muted/40">
            {busy ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">Upload a product sheet</p>
              <p className="text-xs text-muted-foreground">.xlsx, .xls or .csv</p>
            </div>
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFile} disabled={busy} />
          </label>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Map columns &amp; choose marketplace</CardTitle>
        <p className="text-sm text-muted-foreground">{rowCount} products detected.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>Target marketplace</Label>
          <Select value={marketplace} onValueChange={setMarketplace}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MARKETPLACES.map((m) => (
                <SelectItem key={m.key} value={m.key}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CANONICAL_FIELDS.map((key) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs">{CANONICAL_LABELS[key]}</Label>
              <Select
                value={mapping[key] ?? NONE}
                onValueChange={(v) =>
                  setMapping((m) => ({ ...m, [key]: v === NONE ? undefined : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>—</SelectItem>
                  {headers.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={() => setStep('upload')} disabled={busy}>
            Back
          </Button>
          <Button onClick={create} disabled={busy}>
            {busy ? 'Starting…' : `Generate ${rowCount} listings`}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
