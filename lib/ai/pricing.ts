/**
 * Gemini list prices, USD. Verified against ai.google.dev/gemini-api/docs/pricing.
 *
 * Image output is billed per generated image, not per token: an image up to
 * 1024x1024 consumes 1290 output tokens and costs a flat $0.039. Text models
 * bill per token both ways.
 */

export interface ModelPrice {
  /** USD per 1M input tokens. */
  inputPerM: number
  /** USD per 1M output tokens. Omitted for models billed per image. */
  outputPerM?: number
  /** USD per generated image. Takes precedence over outputPerM when set. */
  perImage?: number
}

export const MODEL_PRICES: Record<string, ModelPrice> = {
  'gemini-2.5-flash-lite': { inputPerM: 0.1, outputPerM: 0.4 },
  'gemini-2.5-flash-image': { inputPerM: 0.3, perImage: 0.039 },
}

/** Output tokens the API reports per generated image. */
export const TOKENS_PER_IMAGE = 1290

export interface AiUsage {
  model: string
  inputTokens: number
  outputTokens: number
  images: number
}

/**
 * What one call cost, in USD.
 *
 * An unrecognised model costs 0 rather than throwing — a price we haven't
 * catalogued must never fail an automation that already succeeded and was
 * already paid for.
 */
export function costUsd(usage: AiUsage): number {
  const price = MODEL_PRICES[usage.model]
  if (!price) return 0

  const input = (usage.inputTokens / 1_000_000) * price.inputPerM
  const output =
    price.perImage !== undefined
      ? usage.images * price.perImage
      : (usage.outputTokens / 1_000_000) * (price.outputPerM ?? 0)

  return input + output
}
