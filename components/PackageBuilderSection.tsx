'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Camera,
  FileText,
  Check,
  Upload,
  RotateCcw,
  Boxes,
  ClipboardList,
  ShieldCheck,
  LineChart,
  Lightbulb,
} from 'lucide-react'
import { fadeUp } from '@/lib/animations'
import { cn } from '@/lib/utils'
import RevealHeading from './ui/RevealHeading'
import MagneticButton from './ui/MagneticButton'
import { useTranslations } from 'next-intl'
import { track } from '@/lib/tracking/visitor'
import {
  quote,
  NEEDS,
  ACCOUNT_MODULES,
  type Need,
  type ModuleKey,
} from '@/lib/pricing/quote'

/**
 * Mix-your-own-package configurator, down to a single account-management
 * feature — "we only want you raising our PO's" is a real, priceable request.
 *
 * Shares `quote()` with the chatbot's build_quote tool, so a visitor who asks
 * the bot and a visitor who ticks the boxes get the same number. That is the
 * entire reason the calculator is a pure function in lib/ and not inlined here.
 *
 * Prices match the cards because scripts/check.ts asserts the rate card against
 * the shipped landing content, and that no a-la-carte total undercuts a bundle.
 */

const PLATFORMS = ['Amazon', 'Noon', 'TikTok Shop', 'Shopify'] as const

const CONTENT_ICONS: Record<Need, typeof Camera> = {
  photography: Camera,
  listing: FileText,
}

const MODULE_ICONS: Record<ModuleKey, typeof Camera> = {
  uploading: Upload,
  returns: RotateCcw,
  fba: Boxes,
  'purchase-orders': ClipboardList,
  'brand-registry': ShieldCheck,
  'price-analysis': LineChart,
}

// Thousands separators, en-US in both locales — matches Counter in PricingSection
// so the builder's totals read identically to the plan cards.
const money = (n: number) => n.toLocaleString('en-US')

export default function PackageBuilderSection({ embedded = false }: { embedded?: boolean }) {
  const t = useTranslations('marketing.packageBuilder')
  const [productCount, setProductCount] = useState(50)
  const [content, setContent] = useState<Need[]>(['photography', 'listing'])
  const [modules, setModules] = useState<ModuleKey[]>([])
  const [platforms, setPlatforms] = useState<string[]>(['Amazon'])

  const result = useMemo(
    () => quote({ productCount, content, modules, platforms, contentBilling: 'monthly' }),
    [productCount, content, modules, platforms],
  )

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  // Every line of a custom plan recurs — quote() bills content monthly the
  // moment this builder is involved, so there is no one-time column to render.
  const monthlyLines = result.lines

  const body = (
    <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-12 lg:gap-16">
        {/* ── Controls ───────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 'some', margin: '0px 0px -120px 0px' }}
          className="lg:col-span-7"
        >
          {!embedded && (
            <>
              <span className="eyebrow-index mb-6" data-index="02">
                {t('eyebrow')}
              </span>
              <RevealHeading
                text={t('heading')}
                accent={t.raw('accent') as string[]}
                className="section-title mt-6 mb-5"
              />
            </>
          )}
          <p className="mb-10 max-w-xl text-base leading-relaxed text-flow-text-muted">
            {t('intro')}
          </p>

          {/* One-time content */}
          <fieldset className="mb-9">
            <legend className="font-display text-sm font-bold text-flow-green">
              {t('contentLabel')}
            </legend>
            <p className="mb-3 mt-1 text-xs text-flow-text-muted">{t('contentHint')}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {NEEDS.map((need) => {
                const Icon = CONTENT_ICONS[need]
                const on = content.includes(need)
                return (
                  <button
                    key={need}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setContent((c) => toggle(c, need))}
                    className={cn(
                      'flex flex-col gap-2 rounded-2xl border p-4 text-start transition-all',
                      on
                        ? 'border-flow-green bg-flow-green text-flow-bg shadow-[var(--shadow-md)]'
                        : 'border-flow-border bg-white text-flow-text hover:border-flow-green/40',
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <Icon className={cn('h-5 w-5', on ? 'text-flow-lime' : 'text-flow-green')} />
                      {on && <Check className="h-4 w-4 text-flow-lime" strokeWidth={3} />}
                    </span>
                    <span className="font-display text-sm font-bold">{t(`needs.${need}`)}</span>
                    <span
                      className={cn(
                        'text-xs leading-snug',
                        on ? 'text-flow-bg/70' : 'text-flow-text-muted',
                      )}
                    >
                      {t(`needsHint.${need}`)}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Content is billed per product per month, so the count is only
                meaningful while some content is selected. */}
            {content.length > 0 && (
              <div className="mt-5 rounded-2xl border border-flow-border bg-white p-5">
                <div className="mb-3 flex items-baseline justify-between gap-4">
                  <label htmlFor="pb-count" className="font-display text-sm font-bold text-flow-green">
                    {t('productsLabel')}
                  </label>
                  <span className="font-display text-2xl font-bold text-flow-green">
                    {money(productCount)}
                  </span>
                </div>
                <input
                  id="pb-count"
                  type="range"
                  min={1}
                  max={500}
                  step={1}
                  value={productCount}
                  onChange={(e) => setProductCount(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-flow-border
                             accent-flow-green focus-visible:outline-none focus-visible:ring-2
                             focus-visible:ring-flow-green focus-visible:ring-offset-2"
                />
                <p className="mt-2 text-xs text-flow-text-muted">{t('productsHint')}</p>
              </div>
            )}
          </fieldset>

          {/* Monthly account modules */}
          <fieldset className="mb-9">
            <legend className="font-display text-sm font-bold text-flow-green">
              {t('modulesLabel')}
            </legend>
            <p className="mb-3 mt-1 max-w-lg text-xs text-flow-text-muted">{t('modulesHint')}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {ACCOUNT_MODULES.map((m) => {
                const Icon = MODULE_ICONS[m.key]
                const on = modules.includes(m.key)
                return (
                  <button
                    key={m.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setModules((list) => toggle(list, m.key))}
                    className={cn(
                      'flex items-start gap-3 rounded-2xl border p-4 text-start transition-all',
                      on
                        ? 'border-flow-green bg-flow-green text-flow-bg shadow-[var(--shadow-md)]'
                        : 'border-flow-border bg-white text-flow-text hover:border-flow-green/40',
                    )}
                  >
                    <Icon
                      className={cn(
                        'mt-0.5 h-5 w-5 shrink-0',
                        on ? 'text-flow-lime' : 'text-flow-green',
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-display text-sm font-bold">
                          {t(`modules.${m.key}`)}
                        </span>
                        {on && <Check className="h-4 w-4 shrink-0 text-flow-lime" strokeWidth={3} />}
                      </span>
                      <span
                        className={cn(
                          'mt-1 block text-xs leading-snug',
                          on ? 'text-flow-bg/70' : 'text-flow-text-muted',
                        )}
                      >
                        {t(`modulesDesc.${m.key}`)}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          {/* Platforms */}
          <fieldset>
            <legend className="mb-3 font-display text-sm font-bold text-flow-green">
              {t('platformsLabel')}
            </legend>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => {
                const on = platforms.includes(p)
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setPlatforms((list) => toggle(list, p))}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                      on
                        ? 'border-flow-green bg-flow-green text-flow-bg'
                        : 'border-flow-border bg-white text-flow-text-muted hover:border-flow-green/40',
                    )}
                  >
                    {p}
                  </button>
                )
              })}
            </div>
          </fieldset>
        </motion.div>

        {/* ── Result ─────────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 'some', margin: '0px 0px -120px 0px' }}
          custom={1}
          className="lg:col-span-5 lg:sticky lg:top-28"
        >
          <div
            className="rounded-3xl p-8 text-white shadow-[var(--shadow-glow-lime)]"
            style={{ backgroundImage: 'var(--gradient-dark-panel)' }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-flow-lime/80">
              {t('resultTitle')}
            </p>

            {result.model === 'none' ? (
              <p className="mt-6 text-sm leading-relaxed text-white/70">{t('empty')}</p>
            ) : (
              <>
                <p className="mt-2 font-display text-3xl font-bold text-flow-lime">
                  {t('customPlanName')}
                </p>

                {/* One figure. The whole point of this tab. */}
                <div className="mt-6 border-t border-white/10 pt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                    {t('monthlyTitle')}
                  </p>
                  <p className="mt-1 font-display text-4xl font-bold text-white">
                    {money(result.monthly)}
                    <span className="text-lg font-semibold text-white/60"> {result.currency}</span>
                    <span className="text-base font-normal text-white/50"> {t('perMonth')}</span>
                  </p>
                  {result.salesShare !== null && (
                    <p className="mt-2 text-sm text-flow-lime">
                      {t('salesShare', { share: result.salesShare })}
                    </p>
                  )}
                  <ul className="mt-4 space-y-2">
                    {monthlyLines.map((l) => (
                      <li key={l.key} className="flex items-start justify-between gap-4 text-sm">
                        <span className="text-white/70">
                          {t(`lines.${l.key}`)}
                          {l.qty > 1 && <span className="text-white/40"> × {money(l.qty)}</span>}
                        </span>
                        <span className="shrink-0 font-medium text-white">
                          {money(l.total)} {result.currency}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs leading-relaxed text-white/40">{t('allMonthly')}</p>
                </div>

                {/* A packaged tier that covers the same ground for less. Surfacing
                    it is the honest move and stops the builder undercutting the
                    plans — see the betterBundle note in lib/pricing/quote.ts. */}
                {result.betterBundle && (
                  <p className="mt-6 flex gap-2.5 rounded-xl bg-flow-lime/15 px-4 py-3 text-xs leading-relaxed text-flow-lime">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      {t('betterBundle', {
                        name: result.betterBundle.name,
                        monthly: money(result.betterBundle.monthly),
                        saving: money(result.betterBundle.saving),
                      })}
                    </span>
                  </p>
                )}

                <MagneticButton className="mt-7 w-full">
                  <Link
                    href={`?plan=${result.serviceKey}#contact`}
                    // Recorded on the click, not on every slider tick — this is
                    // the point where a configuration became an intent.
                    onClick={() =>
                      track({
                        type: 'package_configured',
                        serviceKey: result.serviceKey,
                        monthly: result.monthly,
                        oneTime: result.oneTime,
                      })
                    }
                    className="btn-primary flex w-full items-center justify-center gap-2"
                  >
                    {t('cta')}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Link>
                </MagneticButton>

                <p className="mt-4 text-center text-xs leading-relaxed text-white/40">
                  {t('disclaimer')}
                </p>
              </>
            )}
          </div>
        </motion.div>
    </div>
  )

  if (embedded) return body

  return (
    <section id="build" className="section-padding bg-flow-bg-soft">
      <div className="px-5 sm:px-6 lg:px-8">{body}</div>
    </section>
  )
}
