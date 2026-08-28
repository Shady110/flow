'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Cookie } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import {
  consentServerSnapshot,
  consentSnapshot,
  setConsent,
  subscribeConsent,
  track,
} from '@/lib/tracking/visitor'

/**
 * Consent banner, and the only thing that switches visitor tracking on.
 *
 * Nothing is recorded before the visitor accepts — this is analytics, not
 * strictly-necessary storage, so Egypt's PDPL (Law 151/2018) and GDPR both
 * require consent up front rather than an opt-out. Rejecting is remembered too,
 * so the banner does not nag.
 *
 * It also owns the page-view beacon: consent and tracking live together so
 * there is no path where one runs without the other.
 */
export default function CookieConsent() {
  const t = useTranslations('marketing.cookies')
  const pathname = usePathname()
  const consent = useSyncExternalStore(
    subscribeConsent,
    consentSnapshot,
    consentServerSnapshot,
  )

  // One page view per route change, and only once consent exists.
  useEffect(() => {
    if (consent === 'accepted') track({ type: 'page_view', path: pathname })
  }, [consent, pathname])

  return (
    <AnimatePresence>
      {consent === null && (
        <motion.div
          role="dialog"
          aria-label={t('title')}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          // Sits above the chat launcher on mobile, beside it on desktop.
          className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-2xl rounded-2xl border
                     border-flow-border bg-flow-bg p-5 shadow-2xl shadow-flow-green/20
                     sm:inset-x-auto sm:start-5 sm:bottom-5 sm:max-w-md"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-flow-lime text-flow-green">
              <Cookie className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold text-flow-green">{t('title')}</p>
              <p className="mt-1 text-xs leading-relaxed text-flow-text-muted">{t('body')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setConsent('accepted')}
                  className="rounded-full bg-flow-green px-4 py-2 text-xs font-semibold text-flow-bg
                             transition-colors hover:bg-flow-green-hover"
                >
                  {t('accept')}
                </button>
                <button
                  type="button"
                  onClick={() => setConsent('rejected')}
                  className="rounded-full border border-flow-green/25 px-4 py-2 text-xs font-medium
                             text-flow-green transition-colors hover:bg-flow-bg-muted"
                >
                  {t('reject')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
