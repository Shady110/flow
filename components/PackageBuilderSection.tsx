'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Camera, FileText, Store, Check } from 'lucide-react'
import { fadeUp } from '@/lib/animations'
import { cn } from '@/lib/utils'
import RevealHeading from './ui/RevealHeading'
import MagneticButton from './ui/MagneticButton'
import { useTranslations } from 'next-intl'
import { quote, NEEDS, type Need } from '@/lib/pricing/quote'
import { pricingTabs, type PricingContent } from '@/data/landing-content'

/**
 * Mix-your-own-package configurator.
 *
 * Shares `quote()` with the chatbot's build_quote tool, so a visitor who asks
 * the bot and a visitor who drags the slider get the same number. That is the
 * entire reason the calculator is a pure function in lib/ and not inlined here.
 *
 * Prices match the cards because scripts/check.ts asserts the rate card against
 * the shipped landing content.
 */

const PLATFORMS = ['Amazon', 'Noon', 'TikTok Shop', 'Shopify'] as const

const NEED_ICONS: Record<Need, typeof Camera> = {
  photography: Camera,
  listing: FileText,
  accountManagement: Store,
}

// Thousands separators, en-US in both locales — matches Counter in PricingSection
// so the builder's totals read identically to the plan cards above it.
const money = (n: number) => n.toLocaleString('en-US')

export default function PackageBuilderSection({ pricing }: { pricing: PricingContent }) {
  const t = useTranslations('marketing.packageBuilder')
  const [productCount, setProductCount] = useState(50)
  const [needs, setNeeds] = useState<Need[]>(['photography', 'listing'])
  const [platforms, setPlatforms] = useState<string[]>(['Amazon'])

  const result = useMemo(
    () => quote({ productCount, needs, platforms }),
    [productCount, needs, platforms],
  )

  // Take the plan's display name from the pricing cards rather than the rate
  // card, so the builder says "المحتوى الكامل" on the Arabic page and picks up
  // any rename made in /internal/settings/landing. quote()'s own English name
  // is the fallback for a serviceKey with no matching card.
  const planName = useMemo(() => {
    const card = pricingTabs(pricing)
      .flatMap((tab) => tab.plans)
      .find((p) => p.serviceKey === result.serviceKey)
    return card?.name ?? result.planName
  }, [pricing, result.serviceKey, result.planName])

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  const href = `/?plan=${result.serviceKey}#contact`

  return (
    <section id="build" className="section-padding bg-flow-bg-soft">
      <div className="mx-auto grid max-w-7xl items-start gap-12 px-5 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        {/* ── Controls ───────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="lg:col-span-7"
        >
          <span className="eyebrow-index mb-6" data-index="05">
            {t('eyebrow')}
          </span>
          <RevealHeading
            text={t('heading')}
            accent={t.raw('accent') as string[]}
            className="section-title mt-6 mb-5"
          />
          <p className="mb-10 max-w-xl text-base leading-relaxed text-flow-text-muted">
            {t('intro')}
          </p>

          {/* Product count */}
          <div className="mb-9">
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

          {/* Needs */}
          <fieldset className="mb-9">
            <legend className="mb-3 font-display text-sm font-bold text-flow-green">
              {t('needsLabel')}
            </legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {NEEDS.map((need) => {
                const Icon = NEED_ICONS[need]
                const on = needs.includes(need)
                return (
                  <button
                    key={need}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setNeeds((n) => toggle(n, need))}
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
                      className={cn('text-xs leading-snug', on ? 'text-flow-bg/70' : 'text-flow-text-muted')}
                    >
                      {t(`needsHint.${need}`)}
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
          viewport={{ once: true, amount: 0.2 }}
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
                <p className="mt-2 font-display text-3xl font-bold text-flow-lime">{planName}</p>

                <div className="mt-6 border-t border-white/10 pt-6">
                  {result.monthly > 0 && (
                    <p className="font-display text-4xl font-bold text-white">
                      {money(result.monthly)}
                      <span className="text-lg font-semibold text-white/60"> {result.currency}</span>
                      <span className="text-base font-normal text-white/50"> {t('perMonth')}</span>
                    </p>
                  )}
                  {result.oneTime > 0 && (
                    <p className="font-display text-4xl font-bold text-white">
                      {money(result.oneTime)}
                      <span className="text-lg font-semibold text-white/60"> {result.currency}</span>
                      <span className="text-base font-normal text-white/50"> {t('oneTime')}</span>
                    </p>
                  )}
                  {result.salesShare && (
                    <p className="mt-2 text-sm text-flow-lime">
                      {result.salesShare.from === result.salesShare.cap
                        ? t('salesShareFixed', { from: result.salesShare.from })
                        : t('salesShareRange', {
                            from: result.salesShare.from,
                            cap: result.salesShare.cap,
                          })}
                    </p>
                  )}
                </div>

                {/* Line items */}
                <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-6">
                  {result.lines.map((l) => (
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

                {result.overage && (
                  <p className="mt-4 rounded-xl bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/60">
                    {t('overage', { count: result.overage.count, rate: result.overage.rate })}
                  </p>
                )}

                <MagneticButton className="mt-7 w-full">
                  <Link
                    href={href}
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
    </section>
  )
}
