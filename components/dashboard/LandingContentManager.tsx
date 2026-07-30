'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Save, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Textarea } from '@/components/ds/textarea'
import { Label } from '@/components/ds/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ds/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import { updateLandingSectionAction, resetLandingSectionAction } from '@/lib/db/landing-actions'
import { LANDING_SECTIONS, pricingTabs, type LandingSection } from '@/data/landing-content'
import { SERVICE_OPTIONS } from '@/lib/service-options'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Blob = Record<string, any>
type Rows = Record<LandingSection, { en: Blob; ar: Blob }>

const SECTION_LABELS: Record<LandingSection, string> = {
  hero: 'Hero',
  services: 'Services',
  pricing: 'Pricing',
  faq: 'FAQ',
  contact: 'Contact',
}

/* ── Small field primitives ─────────────────────────────── */
function TextField({
  label, value, onChange, textarea,
}: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {textarea ? (
        <Textarea rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  )
}

function LinesField({
  label, value, onChange,
}: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label} <span className="text-xs text-muted-foreground">(one per line)</span></Label>
      <Textarea
        rows={Math.max(3, (value?.length ?? 0) + 1)}
        value={(value ?? []).join('\n')}
        onChange={(e) => onChange(e.target.value.split('\n').filter((l) => l.trim() !== ''))}
      />
    </div>
  )
}

function RepeatBlock({
  title, onRemove, children,
}: { title: string; onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {children}
    </div>
  )
}

/* ── Per-section editors ────────────────────────────────── */
function SectionEditor({
  section, data, set,
}: { section: LandingSection; data: Blob; set: (d: Blob) => void }) {
  const field = (key: string, v: any) => set({ ...data, [key]: v })

  if (section === 'hero') {
    return (
      <div className="space-y-4">
        <TextField label="Badge" value={data.badge} onChange={(v) => field('badge', v)} />
        <TextField label="Heading" value={data.heading} onChange={(v) => field('heading', v)} />
        <TextField label="Subheading" value={data.subheading} onChange={(v) => field('subheading', v)} textarea />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Primary CTA" value={data.ctaPrimary} onChange={(v) => field('ctaPrimary', v)} />
          <TextField label="Secondary CTA" value={data.ctaSecondary} onChange={(v) => field('ctaSecondary', v)} />
        </div>
        <div className="space-y-2">
          <Label>Stats</Label>
          {(data.stats ?? []).map((s: Blob, i: number) => (
            <RepeatBlock
              key={i}
              title={`Stat ${i + 1}`}
              onRemove={() => field('stats', data.stats.filter((_: Blob, j: number) => j !== i))}
            >
              <div className="grid grid-cols-3 gap-3">
                <TextField label="Value" value={String(s.value ?? '')} onChange={(v) => {
                  const stats = [...data.stats]; stats[i] = { ...s, value: Number(v) || 0 }; field('stats', stats)
                }} />
                <TextField label="Suffix" value={s.suffix} onChange={(v) => {
                  const stats = [...data.stats]; stats[i] = { ...s, suffix: v }; field('stats', stats)
                }} />
                <TextField label="Label" value={s.label} onChange={(v) => {
                  const stats = [...data.stats]; stats[i] = { ...s, label: v }; field('stats', stats)
                }} />
              </div>
            </RepeatBlock>
          ))}
        </div>
      </div>
    )
  }

  if (section === 'services') {
    return (
      <div className="space-y-4">
        <TextField label="Eyebrow" value={data.eyebrow} onChange={(v) => field('eyebrow', v)} />
        <TextField label="Heading" value={data.heading} onChange={(v) => field('heading', v)} />
        <TextField label="Full-service badge" value={data.fullServiceBadge} onChange={(v) => field('fullServiceBadge', v)} />
        <div className="space-y-2">
          <Label>Services</Label>
          {(data.items ?? []).map((item: Blob, i: number) => (
            <RepeatBlock
              key={i}
              title={item.title || `Service ${i + 1}`}
              onRemove={() => field('items', data.items.filter((_: Blob, j: number) => j !== i))}
            >
              <TextField label="Title" value={item.title} onChange={(v) => {
                const items = [...data.items]; items[i] = { ...item, title: v }; field('items', items)
              }} />
              <TextField label="Description" value={item.description} textarea onChange={(v) => {
                const items = [...data.items]; items[i] = { ...item, description: v }; field('items', items)
              }} />
              <LinesField label="Features" value={item.features ?? []} onChange={(v) => {
                const items = [...data.items]; items[i] = { ...item, features: v }; field('items', items)
              }} />
            </RepeatBlock>
          ))}
        </div>
      </div>
    )
  }

  if (section === 'pricing') {
    const blankPlan = { kicker: '', priceText: '', unit: '', name: '', features: [], cta: '' }
    const tabs: Blob[] = pricingTabs(data as never) as unknown as Blob[]
    const setTabs = (t: Blob[]) => set({ ...data, tabs: t, plans: undefined })
    const updTab = (i: number, patch: Blob) => {
      const next = [...tabs]; next[i] = { ...tabs[i], ...patch }; setTabs(next)
    }
    return (
      <div className="space-y-4">
        <TextField label="Eyebrow" value={data.eyebrow} onChange={(v) => field('eyebrow', v)} />
        <TextField label="Heading" value={data.heading} onChange={(v) => field('heading', v)} />
        <TextField label="Subheading" value={data.subheading} textarea onChange={(v) => field('subheading', v)} />
        <div className="space-y-3">
          <Label>Tabs</Label>
          {tabs.map((tab, ti) => {
            const plans: Blob[] = tab.plans ?? []
            const setPlans = (p: Blob[]) => updTab(ti, { plans: p })
            return (
              <RepeatBlock
                key={ti}
                title={tab.label || `Tab ${ti + 1}`}
                onRemove={() => setTabs(tabs.filter((_, j) => j !== ti))}
              >
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Tab label" value={tab.label} onChange={(v) => updTab(ti, { label: v })} />
                  <TextField label="Tab id (stable key)" value={tab.id} onChange={(v) => updTab(ti, { id: v })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Tab badge" value={tab.badge ?? ''} onChange={(v) => updTab(ti, { badge: v || undefined })} />
                  <TextField label="Footnote (under the cards)" value={tab.footnote ?? ''} onChange={(v) => updTab(ti, { footnote: v || undefined })} />
                </div>
                <TextField label="Tagline" value={tab.tagline ?? ''} textarea onChange={(v) => updTab(ti, { tagline: v || undefined })} />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="defaultTab"
                    checked={data.defaultTab === tab.id}
                    onChange={() => field('defaultTab', tab.id)}
                    className="h-4 w-4 accent-flow-green"
                  />
                  Opens first (the tab we push people to)
                </label>

                <div className="space-y-2 border-t border-border pt-3">
                  <Label>Plans in this tab</Label>
                  {plans.map((plan, i) => {
                    const upd = (patch: Blob) => {
                      const next = [...plans]; next[i] = { ...plan, ...patch }; setPlans(next)
                    }
                    const rows: Blob[] = plan.bulk?.rows ?? []
                    const setRows = (r: Blob[]) =>
                      upd({ bulk: r.length ? { title: plan.bulk?.title ?? '', rows: r } : undefined })
                    return (
                      <RepeatBlock
                        key={i}
                        title={plan.name || `Plan ${i + 1}`}
                        onRemove={() => setPlans(plans.filter((_, j) => j !== i))}
                      >
                        <TextField label="Kicker" value={plan.kicker} onChange={(v) => upd({ kicker: v })} />
                        <TextField label="Name" value={plan.name} onChange={(v) => upd({ name: v })} />
                        <div className="grid grid-cols-3 gap-3">
                          <TextField label="Price value (number)" value={plan.priceValue != null ? String(plan.priceValue) : ''} onChange={(v) => upd({ priceValue: v === '' ? undefined : Number(v) })} />
                          <TextField label="Price suffix" value={plan.priceSuffix ?? ''} onChange={(v) => upd({ priceSuffix: v })} />
                          <TextField label="Price text (overrides)" value={plan.priceText ?? ''} onChange={(v) => upd({ priceText: v || undefined })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <TextField label="Unit" value={plan.unit} onChange={(v) => upd({ unit: v })} />
                          <TextField label="Extra note (e.g. + 1.5% of sales)" value={plan.extraNote ?? ''} onChange={(v) => upd({ extraNote: v || undefined })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <TextField label="Badge" value={plan.badge ?? ''} onChange={(v) => upd({ badge: v || undefined })} />
                          <TextField label="CTA" value={plan.cta} onChange={(v) => upd({ cta: v })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>
                            CTA preselects{' '}
                            <span className="text-xs text-muted-foreground">
                              (which contact-form service this plan tags the lead with)
                            </span>
                          </Label>
                          <select
                            value={plan.serviceKey ?? ''}
                            onChange={(e) => upd({ serviceKey: e.target.value || undefined })}
                            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                          >
                            <option value="">Nothing — just jump to the form</option>
                            {SERVICE_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.value}
                              </option>
                            ))}
                          </select>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={!!plan.featured}
                            onChange={(e) => upd({ featured: e.target.checked })}
                            className="h-4 w-4 accent-flow-green"
                          />
                          Featured (highlighted dark card)
                        </label>
                        <TextField label="Note" value={plan.note ?? ''} onChange={(v) => upd({ note: v || undefined })} />
                        <LinesField label="Features" value={plan.features ?? []} onChange={(v) => upd({ features: v })} />

                        {/* Spec table — product caps, sales share, what's included */}
                        <div className="space-y-2">
                          <TextField
                            label="Spec table title"
                            value={plan.bulk?.title ?? ''}
                            onChange={(v) => upd({ bulk: { title: v, rows } })}
                          />
                          {rows.map((r, ri) => (
                            <div key={ri} className="flex items-end gap-2">
                              <div className="flex-1">
                                <TextField label="Label" value={r.label} onChange={(v) => {
                                  const next = [...rows]; next[ri] = { ...r, label: v }; setRows(next)
                                }} />
                              </div>
                              <div className="flex-1">
                                <TextField label="Value" value={r.value} onChange={(v) => {
                                  const next = [...rows]; next[ri] = { ...r, value: v }; setRows(next)
                                }} />
                              </div>
                              <Button type="button" variant="ghost" size="sm" onClick={() => setRows(rows.filter((_, j) => j !== ri))}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button type="button" variant="outline" size="sm" onClick={() => setRows([...rows, { label: '', value: '' }])}>
                            <Plus className="h-4 w-4 me-1" /> Add spec row
                          </Button>
                        </div>
                      </RepeatBlock>
                    )
                  })}
                  <Button type="button" variant="outline" size="sm" onClick={() => setPlans([...plans, blankPlan])}>
                    <Plus className="h-4 w-4 me-1" /> Add plan
                  </Button>
                </div>
              </RepeatBlock>
            )
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTabs([...tabs, { id: `tab-${tabs.length + 1}`, label: '', plans: [] }])}
          >
            <Plus className="h-4 w-4 me-1" /> Add tab
          </Button>
        </div>
      </div>
    )
  }

  if (section === 'faq') {
    return (
      <div className="space-y-4">
        <TextField label="Eyebrow" value={data.eyebrow} onChange={(v) => field('eyebrow', v)} />
        <TextField label="Heading" value={data.heading} onChange={(v) => field('heading', v)} />
        <TextField label="Intro" value={data.intro} textarea onChange={(v) => field('intro', v)} />
        <TextField label="CTA" value={data.cta} onChange={(v) => field('cta', v)} />
        <div className="space-y-2">
          <Label>Questions</Label>
          {(data.items ?? []).map((item: Blob, i: number) => (
            <RepeatBlock
              key={i}
              title={item.question || `Question ${i + 1}`}
              onRemove={() => field('items', data.items.filter((_: Blob, j: number) => j !== i))}
            >
              <TextField label="Question" value={item.question} onChange={(v) => {
                const items = [...data.items]; items[i] = { ...item, question: v }; field('items', items)
              }} />
              <TextField label="Answer" value={item.answer} textarea onChange={(v) => {
                const items = [...data.items]; items[i] = { ...item, answer: v }; field('items', items)
              }} />
            </RepeatBlock>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => field('items', [...(data.items ?? []), { question: '', answer: '' }])}>
            <Plus className="h-4 w-4 me-1" /> Add question
          </Button>
        </div>
      </div>
    )
  }

  // contact
  return (
    <div className="space-y-4">
      <TextField label="Eyebrow" value={data.eyebrow} onChange={(v) => field('eyebrow', v)} />
      <TextField label="Heading" value={data.heading} onChange={(v) => field('heading', v)} />
      <TextField label="Intro" value={data.intro} textarea onChange={(v) => field('intro', v)} />
      <LinesField label="Phone numbers" value={data.phones ?? []} onChange={(v) => field('phones', v)} />
      <TextField label="Email" value={data.email} onChange={(v) => field('email', v)} />
      <TextField label="Location" value={data.location} onChange={(v) => field('location', v)} />
    </div>
  )
}

/* ── Root manager ───────────────────────────────────────── */
export default function LandingContentManager({ rows }: { rows: Rows }) {
  const [drafts, setDrafts] = useState<Rows>(rows)
  const [active, setActive] = useState<LandingSection>('hero')
  const [pending, startTransition] = useTransition()

  function setSectionLang(section: LandingSection, lang: 'en' | 'ar', data: Blob) {
    setDrafts((d) => ({ ...d, [section]: { ...d[section], [lang]: data } }))
  }

  function save(section: LandingSection) {
    startTransition(async () => {
      const res = await updateLandingSectionAction({
        section,
        content_en: drafts[section].en,
        content_ar: drafts[section].ar,
      })
      if (res.ok) toast.success(`${SECTION_LABELS[section]} saved`)
      else toast.error(res.error)
    })
  }

  function reset(section: LandingSection) {
    if (!confirm(`Discard the saved ${SECTION_LABELS[section]} content and restore the built-in default?`)) return
    startTransition(async () => {
      const res = await resetLandingSectionAction(section)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      // Full reload: the drafts are local state seeded from the server, and the
      // point of a reset is to throw that away and re-read the defaults.
      window.location.reload()
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
      {/* Section nav */}
      <nav className="flex gap-2 overflow-x-auto lg:flex-col">
        {LANDING_SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={`rounded-lg px-3 py-2 text-start text-sm font-medium transition-colors ${
              active === s
                ? 'bg-secondary text-secondary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {SECTION_LABELS[s]}
          </button>
        ))}
      </nav>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{SECTION_LABELS[active]}</CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={() => reset(active)} disabled={pending} size="sm" variant="outline">
              <RotateCcw className="h-4 w-4 me-1.5" /> Reset to default
            </Button>
            <Button onClick={() => save(active)} disabled={pending} size="sm">
              <Save className="h-4 w-4 me-1.5" /> {pending ? 'Saving…' : 'Save section'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="en">
            <TabsList className="mb-4">
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="ar">العربية</TabsTrigger>
            </TabsList>
            <TabsContent value="en">
              <SectionEditor
                section={active}
                data={drafts[active].en}
                set={(d) => setSectionLang(active, 'en', d)}
              />
            </TabsContent>
            <TabsContent value="ar">
              <div dir="rtl">
                <SectionEditor
                  section={active}
                  data={drafts[active].ar}
                  set={(d) => setSectionLang(active, 'ar', d)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
