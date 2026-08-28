/**
 * Client-side visitor beacon. Fires only after the cookie banner is accepted —
 * `CookieConsent` writes the flag this reads, and nothing here runs without it.
 *
 * Pure fire-and-forget: tracking must never block a render, surface an error to
 * a visitor, or throw into a component. Every call is wrapped.
 */

export const CONSENT_KEY = 'flow_consent'

export type VisitorEvent =
  | { type: 'page_view'; path: string }
  | { type: 'chat_opened' }
  | { type: 'package_configured'; serviceKey: string; monthly: number; oneTime: number }

export type Consent = 'accepted' | 'rejected' | null

/**
 * localStorage is an external store, so it is read through
 * useSyncExternalStore rather than copied into state inside an effect. That
 * keeps the server and the first client render in agreement — the failure mode
 * that previously left the chat launcher stuck at opacity 0.
 */
let listeners: (() => void)[] = []

export function subscribeConsent(cb: () => void): () => void {
  listeners.push(cb)
  return () => {
    listeners = listeners.filter((l) => l !== cb)
  }
}

export function consentSnapshot(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    return v === 'accepted' || v === 'rejected' ? v : null
  } catch {
    // Private mode / storage disabled: no way to record a choice, so do not ask
    // for one and never track.
    return 'rejected'
  }
}

/** Server render and hydration: never show the banner, never assume consent. */
export const consentServerSnapshot = (): Consent => 'rejected'

export function setConsent(value: Exclude<Consent, null>): void {
  try {
    localStorage.setItem(CONSENT_KEY, value)
  } catch {
    /* nothing to persist — the banner simply reappears next visit */
  }
  for (const l of listeners) l()
}

/** Whether the visitor has actively accepted. Absent or 'rejected' means no. */
export function hasConsent(): boolean {
  return consentSnapshot() === 'accepted'
}

export function track(event: VisitorEvent): void {
  if (typeof window === 'undefined' || !hasConsent()) return

  const body = JSON.stringify({
    ...event,
    referrer: document.referrer || undefined,
    locale: document.documentElement.lang || undefined,
    // UTM params matter on the first hit; the server keeps whatever it sees first.
    search: window.location.search || undefined,
  })

  try {
    // sendBeacon survives the page being closed mid-navigation; fetch is the
    // fallback where it is unavailable or refuses the payload.
    if (!navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'application/json' }))) {
      void fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    /* tracking is never worth an error in front of a visitor */
  }
}
