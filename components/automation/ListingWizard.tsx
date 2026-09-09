'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadCloud, Loader2, FileSpreadsheet, ArrowRight, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/browser'
import {
  getUploadUrlAction,
  parseSheetAction,
  parseTemplateAction,
  createListingJobAction,
  type TemplateSummary,
} from '@/lib/db/automation-actions'
import { detectReceivingColumns } from '@/lib/automation/listing-rules'
import type { ListingStage } from '@/lib/types'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ds/select'
import { cn } from '@/lib/utils'

const STAGES: { key: ListingStage; title: string; desc: string; source: string }[] = [
  {
    key: 'collecting',
    title: 'Collecting sheet only',
    desc: 'Enrich the receiving sheet into full product data. Review it in Excel, then come back and run the Amazon stage.',
    source: 'receiving sheet',
  },
  {
    key: 'full',
    title: 'Collecting + Amazon',
    desc: 'Straight through: receiving sheet in, both the collecting sheet and an uploadable Amazon flat file out.',
    source: 'receiving sheet',
  },
  {
    key: 'amazon',
    title: 'Amazon from an edited collecting sheet',
    desc: 'Skip generation and build the flat file from a collecting sheet you have already corrected. Nothing is regenerated or re-billed.',
    source: 'collecting sheet',
  },
]

/** Prefer a sensible default from the template's own list, else the first value. */
function pickDefault(key: string, values: string[]): string {
  if (values.length === 0) return ''
  const want: Record<string, RegExp> = {
    productIdType: /^GTIN Exempt$/i, // UPCs are left blank by policy
    countryOfOrigin: /^Egypt$/i,
    condition: /^New$/i,
    currency: /^EGP$/i,
    dangerousGoods: /not applicable|^none$/i,
    skipOffer: /^Yes$/i,
    listingAction: /create or replace/i,
  }
  const re = want[key]
  return (re && values.find((v) => re.test(v))) || values[0]
}

export function ListingWizard() {
  const router = useRouter()
  const [step, setStep] = useState<'mode' | 'source' | 'template' | 'constants'>('mode')
  const [busy, setBusy] = useState(false)
  const [stage, setStage] = useState<ListingStage>('full')

  const [sourcePath, setSourcePath] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [skuColumn, setSkuColumn] = useState('')
  const [titleColumn, setTitleColumn] = useState('')

  const [templatePath, setTemplatePath] = useState('')
  const [summary, setSummary] = useState<TemplateSummary | null>(null)
  const [constants, setConstants] = useState<Record<string, string>>({})

  const stageInfo = STAGES.find((s) => s.key === stage)!

  async function upload(file: File): Promise<string> {
    const res = await getUploadUrlAction(crypto.randomUUID(), file.name)
    if (!res.ok) throw new Error(res.error)
    const { error } = await createClient()
      .storage.from('automation-inputs')
      .uploadToSignedUrl(res.path, res.token, file)
    if (error) throw error
    return res.path
  }

  async function onSource(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const path = await upload(file)
      const parsed = await parseSheetAction(path)
      if (!parsed.ok) throw new Error(parsed.error)
      if (parsed.rowCount === 0) throw new Error('That sheet has no data rows.')

      setSourcePath(path)
      setHeaders(parsed.headers)
      setRowCount(parsed.rowCount)
      // Same detector the server uses; the selects below let you override it
      // before anything is spent.
      const guess = detectReceivingColumns(parsed.headers)
      setSkuColumn(guess.sku)
      setTitleColumn(guess.title)
      setStep(stage === 'collecting' ? 'source' : 'template')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  async function onTemplate(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const path = await upload(file)
      const res = await parseTemplateAction(path)
      if (!res.ok) throw new Error(res.error)
      setTemplatePath(path)
      setSummary(res.summary)
      setConstants(
        Object.fromEntries(res.summary.constants.map((c) => [c.key, pickDefault(c.key, c.values)])),
      )
      setStep('constants')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not read the template')
    } finally {
      setBusy(false)
    }
  }

  async function create() {
    setBusy(true)
    const res = await createListingJobAction({
      inputPath: sourcePath,
      stage,
      skuColumn,
      titleColumn,
      templatePath: templatePath || undefined,
      constants,
    })
    setBusy(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    router.push(`/automations/${res.jobId}`)
  }

  // ── Step 1: what to generate ──────────────────────────────────────────────
  if (step === 'mode') {
    return (
      <div className="space-y-3">
        {STAGES.map((s) => (
          <Card
            key={s.key}
            role="button"
            tabIndex={0}
            onClick={() => {
              setStage(s.key)
              setStep('source')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setStage(s.key)
                setStep('source')
              }
            }}
            className="cursor-pointer transition-shadow hover:shadow-md"
          >
            <CardContent className="flex items-start gap-4 p-5">
              <div className="rounded-xl bg-secondary p-2.5 text-flow-green">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground rtl:-scale-x-100" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // ── Step 2: source sheet ──────────────────────────────────────────────────
  if (step === 'source' && !sourcePath) {
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
              <p className="text-sm font-medium">Upload the {stageInfo.source}</p>
              <p className="text-xs text-muted-foreground">.xlsx, .xls or .csv</p>
            </div>
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onSource} disabled={busy} />
          </label>
          <Button variant="ghost" className="mt-4" onClick={() => setStep('mode')} disabled={busy}>
            Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ── Step 3: the Amazon flat file ──────────────────────────────────────────
  if (step === 'template') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload the Amazon template</CardTitle>
          <p className="text-sm text-muted-foreground">
            The category flat file from Seller Central, unmodified. Its own field list, required
            fields and dropdown values are read straight out of the file.
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-14 text-center transition-colors hover:border-flow-green/40 hover:bg-muted/40">
            {busy ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
            )}
            <p className="text-sm font-medium">Drop the .xlsm here</p>
            <input type="file" accept=".xlsm,.xlsx" className="hidden" onChange={onTemplate} disabled={busy} />
          </label>
          <Button variant="ghost" className="mt-4" onClick={() => setStep('mode')} disabled={busy}>
            Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ── Step 4: confirm columns + job constants ───────────────────────────────
  const sourceReady = stage === 'amazon' || (skuColumn && titleColumn)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{stageInfo.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {rowCount} products
          {summary && (
            <>
              {' · '}
              {summary.productType || 'template'} · {summary.fieldCount} columns,{' '}
              {summary.generateCount} generated per product
            </>
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {stage !== 'amazon' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">SKU column</Label>
              <Select value={skuColumn} onValueChange={setSkuColumn}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {headers.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Supplier title column</Label>
              <Select value={titleColumn} onValueChange={setTitleColumn}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {headers.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {summary && (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium">Applied to every product</h4>
              <p className="text-xs text-muted-foreground">
                Facts about your business, never guessed. Options come from the template&apos;s own
                dropdown lists, so an invalid value is impossible.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {summary.constants.map((c) => (
                <div key={c.key} className="space-y-1.5">
                  <Label className="text-xs">{c.label}</Label>
                  {c.values.length > 0 ? (
                    <Select
                      value={constants[c.key] ?? ''}
                      onValueChange={(v) => setConstants((s) => ({ ...s, [c.key]: v }))}
                    >
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        {c.values.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={constants[c.key] ?? ''}
                      onChange={(e) => setConstants((s) => ({ ...s, [c.key]: e.target.value }))}
                      placeholder={c.label}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <p className={cn('rounded-lg bg-muted px-4 py-2.5 text-xs text-muted-foreground')}>
          <CheckCircle2 className="me-1.5 inline h-3.5 w-3.5" />
          Barcodes are never generated. UPC is left blank and every row is flagged for review, along
          with any spec the model estimated rather than read from the title.
        </p>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={() => setStep('mode')} disabled={busy}>
            Back
          </Button>
          <Button onClick={create} disabled={busy || !sourceReady}>
            {busy ? 'Starting…' : `Generate ${rowCount} products`}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
