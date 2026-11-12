'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { saveContractAction } from '@/lib/db/contract-actions'
import { PLATFORM_NAMES, leftoverPlaceholders, renderContract } from '@/lib/contracts'
import { STARTER_CONTRACT } from '@/lib/contract-starter'
import { ContractDocument } from '@/components/contracts/ContractDocument'
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
 * Builds a contract: pick the client and everything is filled in; the text is written
 * from the template and the terms as you type, and the page on the right is the contract
 * exactly as the client will see it. The raw text is under "Edit the text" for the rare
 * hand edit. Terms and text stay separate on purpose: the text is final once sent, the
 * terms feed billing.
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
  // null = follow the template; a string = the text was edited by hand (or is a saved draft).
  const [custom, setCustom] = useState<string | null>(contract?.body ?? null)

  const client = clients.find((c) => c.id === clientId) ?? null
  const deal = draftToDeal(draft, client?.platforms ?? [])
  const validDeal = parseDeal(deal)

  // "No template" means the built-in standard agreement in the chosen language.
  const tplBody = templates.find((x) => x.id === templateId)?.body ?? STARTER_CONTRACT[locale].body
  const rendered = useMemo(() => {
    if (!client || !validDeal) return null
    return renderContract(tplBody, {
      locale,
      client_name: client.name,
      company: legalName.trim(),
      contact_name: contact.trim(),
      platforms: client.platforms.map((p) => PLATFORM_NAMES[locale][p] ?? p),
      start_date: startDate,
      today: today(),
      deal: validDeal,
    })
    // validDeal is rebuilt every render; its JSON is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, JSON.stringify(validDeal), tplBody, locale, legalName, contact, startDate])

  const body = custom ?? rendered?.text ?? ''
  const unresolved = custom !== null ? leftoverPlaceholders(custom) : (rendered?.unresolved ?? [])

  function pickClient(id: string) {
    const c = clients.find((x) => x.id === id)
    setClientId(id)
    if (!c) return
    setLegalName(c.name)
    setContact(c.contactName)
    setTitle(`Service agreement – ${c.name}`)
    if (c.deal) setDraft(dealToDraft(c.deal))
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

  const preview = {
    id: 'preview', client_id: clientId, template_id: null, title: title || '—', locale, body,
    body_sha256: null, terms: validDeal, start_date: startDate || null, status: 'draft',
    accepted_offline: false,
  } as unknown as Contract

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{t('whoAndWhat')}</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="space-y-1">
              <Label>{t('client')}</Label>
              <StageSelect value={clientId || 'none'} label={t('client')} disabled={!!contract}
                options={[{ value: 'none', label: t('pickClient') }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
                onChange={(v) => pickClient(v === 'none' ? '' : v)} />
            </div>
            <div className="space-y-1">
              <Label>{t('template')}</Label>
              <StageSelect value={templateId} label={t('template')}
                options={[{ value: 'none', label: t('defaultTemplate') }, ...templates.map((x) => ({ value: x.id, label: `${x.name} (${x.locale})` }))]}
                onChange={(v) => {
                  setTemplateId(v)
                  setCustom(null)
                  const tpl = templates.find((x) => x.id === v)
                  if (tpl) setLocale(tpl.locale)
                }} />
            </div>
            <div className="space-y-1">
              <Label>{t('language')}</Label>
              <StageSelect value={locale} label={t('language')}
                options={[{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }]}
                onChange={(v) => { setLocale(v); setCustom(null) }} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="c-start">{t('startDate')}</Label>
              <Input id="c-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1 sm:col-span-2 xl:col-span-1">
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

        <details className="rounded-xl border border-border bg-card p-4">
          <summary className="cursor-pointer text-sm font-semibold">{t('editText')}</summary>
          <div className="mt-3 space-y-3">
            {custom !== null && (
              <Button type="button" variant="outline" size="sm" onClick={() => setCustom(null)}>
                {t('resetText')}
              </Button>
            )}
            <Textarea rows={18} dir={locale === 'ar' ? 'rtl' : 'ltr'} value={body} onChange={(e) => setCustom(e.target.value)} />
          </div>
        </details>

        {unresolved.length > 0 && (
          <p className="text-sm text-destructive">
            {t('unresolved')} {unresolved.map((k) => `{{${k}}}`).join(', ')}
          </p>
        )}
        {!validDeal && <p className="text-sm text-muted-foreground">{t('termsIncomplete')}</p>}

        <div className="flex gap-2">
          <Button onClick={save} disabled={pending || !client || !validDeal || unresolved.length > 0}>{t('saveDraft')}</Button>
          <Button variant="ghost" onClick={() => router.back()}>{t('cancel')}</Button>
        </div>
      </div>

      <div className="min-w-0 xl:sticky xl:top-4 xl:self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('preview')}</p>
        {body ? (
          <ContractDocument contract={preview} clientName={client?.name ?? '—'} />
        ) : (
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{t('previewEmpty')}</p>
        )}
      </div>
    </div>
  )
}
