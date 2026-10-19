'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { saveContractAction } from '@/lib/db/contract-actions'
import { PLATFORM_NAMES, renderContract } from '@/lib/contracts'
import { parseDeal, type Deal } from '@/lib/deals'
import { DealEditor, dealToDraft, draftToDeal, type DealDraft } from '@/components/deals/DealEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ds/card'
import { Button } from '@/components/ds/button'
import { Input } from '@/components/ds/input'
import { Label } from '@/components/ds/label'
import { Textarea } from '@/components/ds/textarea'
import { StageSelect } from '@/components/flow/StageSelect'
import type { Contract, ContractTemplate } from '@/lib/types'

export interface ComposerClient {
  id: string
  name: string
  contactName: string
  platforms: string[]
  deal: Deal | null
}

const today = () => new Date().toISOString().slice(0, 10)

/**
 * Builds a contract: pick the client and template, set the terms, press
 * "Fill from template", tweak the text, save as a draft. Terms and text are
 * kept separate on purpose — the text is final once sent, the terms feed billing.
 */
export function ContractComposer({
  clients,
  templates,
  initialClientId,
  contract,
}: {
  clients: ComposerClient[]
  templates: ContractTemplate[]
  initialClientId?: string
  contract?: Contract
}) {
  const router = useRouter()
  const t = useTranslations('internal.contracts')
  const [pending, startTransition] = useTransition()

  const first = clients.find((c) => c.id === (contract?.client_id ?? initialClientId)) ?? null
  const startDeal = parseDeal(contract?.terms) ?? first?.deal ?? null

  const [clientId, setClientId] = useState(first?.id ?? '')
  const [templateId, setTemplateId] = useState(contract?.template_id ?? 'none')
  const [locale, setLocale] = useState<'en' | 'ar'>(contract?.locale ?? 'en')
  const [title, setTitle] = useState(contract?.title ?? (first ? `Service agreement – ${first.name}` : ''))
  const [legalName, setLegalName] = useState(first?.name ?? '')
  const [contact, setContact] = useState(first?.contactName ?? '')
  const [startDate, setStartDate] = useState(contract?.start_date ?? today())
  const [draft, setDraft] = useState<DealDraft>(dealToDraft(startDeal))
  const [body, setBody] = useState(contract?.body ?? '')
  const [unresolved, setUnresolved] = useState<string[]>([])

  const client = clients.find((c) => c.id === clientId) ?? null
  const deal = draftToDeal(draft, client?.platforms ?? [])
  const validDeal = parseDeal(deal)

  function pickClient(id: string) {
    const c = clients.find((x) => x.id === id)
    setClientId(id)
    if (!c) return
    setLegalName(c.name)
    setContact(c.contactName)
    setTitle(`Service agreement – ${c.name}`)
    if (c.deal) setDraft(dealToDraft(c.deal))
  }

  function fill(forTemplate = templateId, forLocale = locale) {
    const tpl = templates.find((x) => x.id === forTemplate)
    if (!tpl || !client || !validDeal) {
      toast.error(t('fillNeeds'))
      return
    }
    const names = PLATFORM_NAMES[forLocale]
    const res = renderContract(tpl.body, {
      locale: forLocale,
      client_name: client.name,
      company: legalName.trim(),
      contact_name: contact.trim(),
      platforms: client.platforms.map((p) => names[p] ?? p),
      start_date: startDate,
      today: today(),
      deal: validDeal,
    })
    setBody(res.text)
    setUnresolved(res.unresolved)
  }

  function save() {
    if (!client) return void toast.error(t('pickClient'))
    startTransition(async () => {
      const res = await saveContractAction(contract?.id ?? null, {
        clientId: client.id,
        templateId: templateId === 'none' ? null : templateId,
        title, locale, body, terms: deal, start_date: startDate || null,
      })
      if (!res.ok) return void toast.error(res.error)
      toast.success(t('draftSaved'))
      router.push(`/contracts/${res.id}`)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">{t('whoAndWhat')}</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>{t('client')}</Label>
            <StageSelect value={clientId || 'none'} label={t('client')} disabled={!!contract}
              options={[{ value: 'none', label: t('pickClient') }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
              onChange={(v) => pickClient(v === 'none' ? '' : v)} />
          </div>
          <div className="space-y-1">
            <Label>{t('template')}</Label>
            <StageSelect value={templateId} label={t('template')}
              options={[{ value: 'none', label: t('noTemplateOption') }, ...templates.map((x) => ({ value: x.id, label: `${x.name} (${x.locale})` }))]}
              onChange={(v) => {
                setTemplateId(v)
                const tpl = templates.find((x) => x.id === v)
                if (tpl) setLocale(tpl.locale)
              }} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="c-title">{t('contractTitle')}</Label>
            <Input id="c-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="c-legal">{t('legalName')}</Label>
            <Input id="c-legal" value={legalName} onChange={(e) => setLegalName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="c-contact">{t('signatory')}</Label>
            <Input id="c-contact" value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="c-start">{t('startDate')}</Label>
            <Input id="c-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t('language')}</Label>
            <StageSelect value={locale} label={t('language')}
              options={[{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }]}
              onChange={setLocale} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{t('terms')}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('platformsLine')}: {client?.platforms.length ? client.platforms.join(', ') : '—'}
          </p>
          <DealEditor value={draft} onChange={setDraft} platforms={client?.platforms ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{t('text')}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Button type="button" variant="outline" size="sm" disabled={templateId === 'none'} onClick={() => fill()}>
            {t('fillFromTemplate')}
          </Button>
          {unresolved.length > 0 && (
            <p className="text-sm text-destructive">
              {t('unresolved')} {unresolved.map((k) => `{{${k}}}`).join(', ')}
            </p>
          )}
          <Textarea rows={24} dir={locale === 'ar' ? 'rtl' : 'ltr'} value={body} onChange={(e) => setBody(e.target.value)} />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={save} disabled={pending}>{t('saveDraft')}</Button>
        <Button variant="ghost" onClick={() => router.back()}>{t('cancel')}</Button>
      </div>
    </div>
  )
}
