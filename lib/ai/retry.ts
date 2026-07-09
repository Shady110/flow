import 'server-only'

const RETRYABLE = /\b(429|500|503)\b|RESOURCE_EXHAUSTED|UNAVAILABLE|overloaded|rate limit|deadline/i

function statusOf(e: unknown): number | undefined {
  const anyE = e as { status?: number; code?: number }
  return typeof anyE?.status === 'number' ? anyE.status : typeof anyE?.code === 'number' ? anyE.code : undefined
}

/**
 * A hard quota (per-day cap, or a free-tier `limit: 0`) will never clear by
 * waiting, so retrying is pointless — bail out immediately with a clear message.
 */
export function hardQuotaMessage(e: unknown): string | null {
  const msg = e instanceof Error ? e.message : String(e)
  if (/limit:\s*0\b/.test(msg) || /PerDay/i.test(msg)) {
    return (
      'Gemini quota exhausted for this model. Image generation is not available on the ' +
      'free tier — enable billing on your Gemini API key (or wait for the daily quota to reset).'
    )
  }
  return null
}

function isRetryable(e: unknown): boolean {
  if (hardQuotaMessage(e)) return false // never retry a hard/daily quota
  const s = statusOf(e)
  if (s === 429 || s === 500 || s === 503) return true
  const msg = e instanceof Error ? e.message : String(e)
  return RETRYABLE.test(msg)
}

/** Pull a server-suggested delay (e.g. `"retryDelay":"7s"`) out of an error. */
function suggestedDelayMs(e: unknown): number | undefined {
  const msg = e instanceof Error ? e.message : String(e)
  const m = msg.match(/retryDelay["':\s]+(\d+(?:\.\d+)?)s/i)
  return m ? Math.ceil(parseFloat(m[1]) * 1000) : undefined
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Retry a Gemini call on transient/quota errors with exponential backoff,
 * honoring a server-suggested retryDelay when present. Lets free-tier bulk runs
 * self-pace to the rate limit instead of failing.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  { retries = 5, baseMs = 2000, maxMs = 40000 }: { retries?: number; baseMs?: number; maxMs?: number } = {},
): Promise<T> {
  let attempt = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn()
    } catch (e) {
      attempt++
      if (attempt > retries || !isRetryable(e)) throw e
      const backoff = Math.min(maxMs, baseMs * 2 ** (attempt - 1)) + Math.floor(Math.random() * 500)
      await sleep(suggestedDelayMs(e) ?? backoff)
    }
  }
}
