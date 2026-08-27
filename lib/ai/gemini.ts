import 'server-only'
import {
  GoogleGenAI,
  Type,
  Modality,
  type Content,
  type FunctionDeclaration,
  type FunctionCall,
  type GenerateContentResponse,
} from '@google/genai'
import { withRetry, hardQuotaMessage } from '@/lib/ai/retry'
import { TOKENS_PER_IMAGE, type AiUsage } from '@/lib/ai/pricing'

export const TEXT_MODEL = 'gemini-2.5-flash-lite'
export const IMAGE_MODEL = 'gemini-2.5-flash-image'

/** A call's payload plus what it cost us in tokens. */
export interface Billed<T> {
  value: T
  usage: AiUsage
}

/**
 * Normalize usageMetadata into something priceable. Every field on it is
 * optional, so default hard.
 *
 * Image count comes from the IMAGE entry in candidatesTokensDetails rather than
 * assuming one — the API reports a flat TOKENS_PER_IMAGE per generated image.
 *
 * ponytail: withRetry retries transparently, and the metadata on the final
 * response does not include tokens burned by earlier attempts. Reported spend is
 * therefore a floor, not a bill. Fixing it means threading usage out of retry.ts.
 */
function readUsage(res: GenerateContentResponse, model: string): AiUsage {
  const u = res.usageMetadata
  const imageTokens =
    u?.candidatesTokensDetails?.find((d) => d.modality === 'IMAGE')?.tokenCount ?? 0
  return {
    model,
    inputTokens: u?.promptTokenCount ?? 0,
    outputTokens: u?.candidatesTokenCount ?? 0,
    images: Math.round(imageTokens / TOKENS_PER_IMAGE),
  }
}

// Billing is per Google-Cloud project, so images can run on a billed key while
// text stays on a free-tier key. GEMINI_IMAGE_API_KEY is optional; it falls back
// to GEMINI_API_KEY when unset.
const clients = new Map<string, GoogleGenAI>()
function genai(apiKey?: string): GoogleGenAI {
  const key = apiKey || process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error('GEMINI_API_KEY is not set. Add it to the environment to run automations.')
  }
  let c = clients.get(key)
  if (!c) {
    c = new GoogleGenAI({ apiKey: key })
    clients.set(key, c)
  }
  return c
}

const imageKey = () => process.env.GEMINI_IMAGE_API_KEY || process.env.GEMINI_API_KEY

export interface GenField {
  key: string
  label: string
  description?: string
}

/**
 * Generate a set of listing fields for one product row. Uses a structured JSON
 * response schema so the output maps cleanly onto the marketplace template.
 */
export async function generateListingFields(
  row: Record<string, unknown>,
  fields: GenField[],
  opts: { marketplace: string; instructions?: string },
): Promise<Billed<Record<string, string>>> {
  const properties: Record<string, { type: Type; description: string }> = {}
  for (const f of fields) {
    properties[f.key] = { type: Type.STRING, description: f.description ?? f.label }
  }

  const systemInstruction =
    `You are an expert e-commerce catalog specialist writing marketplace-compliant ` +
    `listings for ${opts.marketplace}. Write clear, keyword-rich, policy-safe copy. ` +
    `Normalize dimensions to centimetres and weight to kilograms where present. ` +
    `Never invent specifications you cannot infer; leave a field empty if unknown. ` +
    (opts.instructions ?? '')

  let res
  try {
    res = await withRetry(() =>
      genai().models.generateContent({
        model: TEXT_MODEL,
        contents: `Product source data (JSON):\n${JSON.stringify(row)}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: { type: Type.OBJECT, properties, required: fields.map((f) => f.key) },
          temperature: 0.4,
        },
      }),
    )
  } catch (e) {
    throw new Error(hardQuotaMessage(e) ?? (e instanceof Error ? e.message : 'Text generation failed'))
  }

  const usage = readUsage(res, TEXT_MODEL)
  const text = res.text ?? '{}'
  try {
    return { value: JSON.parse(text) as Record<string, string>, usage }
  } catch {
    return { value: {}, usage }
  }
}

export interface ChatTurn {
  /** The model's reply text; empty when it only asked for a tool call. */
  text: string
  /** Tool calls the model wants executed before it can answer. */
  functionCalls: FunctionCall[]
}

/**
 * One conversational turn for the website chatbot, optionally with tools.
 *
 * Deliberately non-streaming: flash-lite answers in a second or two and a
 * typing indicator covers it, whereas streaming interleaved with tool calls is
 * several times the code. Swap to generateContentStream when latency is
 * actually felt.
 */
export async function chat(
  contents: Content[],
  opts: { systemInstruction: string; tools?: FunctionDeclaration[]; temperature?: number },
): Promise<Billed<ChatTurn>> {
  let res
  try {
    res = await withRetry(() =>
      genai().models.generateContent({
        model: TEXT_MODEL,
        contents,
        config: {
          systemInstruction: opts.systemInstruction,
          temperature: opts.temperature ?? 0.7,
          ...(opts.tools?.length ? { tools: [{ functionDeclarations: opts.tools }] } : {}),
        },
      }),
    )
  } catch (e) {
    throw new Error(hardQuotaMessage(e) ?? (e instanceof Error ? e.message : 'Chat failed'))
  }

  return {
    value: { text: res.text ?? '', functionCalls: res.functionCalls ?? [] },
    usage: readUsage(res, TEXT_MODEL),
  }
}

export interface RefImage {
  mimeType: string
  base64: string
}

/** Run the image model on a prompt + reference photos and return the raw bytes. */
async function runImageModel(
  refs: RefImage[],
  prompt: string,
  label: string,
): Promise<Billed<Buffer>> {
  let res
  try {
    res = await withRetry(() =>
      genai(imageKey()).models.generateContent({
        model: IMAGE_MODEL,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              ...refs.map((r) => ({ inlineData: { mimeType: r.mimeType, data: r.base64 } })),
            ],
          },
        ],
        config: {
          // Without IMAGE in responseModalities the model replies with text only.
          responseModalities: [Modality.IMAGE],
          // Left to itself the model matches the source aspect — a portrait photo
          // comes back 768x1344, so only 768px feed the square canvas. Forcing 1:1
          // yields 1024x1024, i.e. a third more detail on the constrained side.
          // imageSize is NOT set here on purpose: gemini-2.5-flash-image accepts
          // '2K'/'4K' without complaint and returns 1024px regardless.
          imageConfig: { aspectRatio: '1:1' },
        },
      }),
    )
  } catch (e) {
    throw new Error(hardQuotaMessage(e) ?? (e instanceof Error ? e.message : 'Image generation failed'))
  }

  const parts = res.candidates?.[0]?.content?.parts ?? []
  for (const part of parts) {
    if (part.inlineData?.data) {
      return { value: Buffer.from(part.inlineData.data, 'base64'), usage: readUsage(res, IMAGE_MODEL) }
    }
  }
  // Surface any text the model returned instead of an image (e.g. a refusal).
  const text = parts
    .map((p) => p.text)
    .filter(Boolean)
    .join(' ')
    .slice(0, 300)
  throw new Error(`No image returned for ${label}${text ? `: ${text}` : '.'}`)
}

/**
 * Generate one white-background e-commerce product image at the requested angle,
 * conditioned on the reference photos so the product identity stays consistent.
 * Returns raw PNG bytes.
 */
export async function generateProductImage(
  refs: RefImage[],
  angle: 'front' | 'side' | 'back',
): Promise<Billed<Buffer>> {
  const prompt =
    `Produce a clean e-commerce catalog image of the SAME product shown in the reference ` +
    `images, viewed from the ${angle}. COMPLETELY REMOVE the original background and ` +
    `replace it with a flat, uniform, pure white background of exactly RGB(255,255,255). ` +
    `Absolutely no gradients, no grey tones, no studio backdrop, no floor or horizon line, ` +
    `no shadows, no reflections, no props, no hands, no text, no watermark. Show ONLY the ` +
    `product, fully in frame, upright and centred. Preserve the product's exact shape, ` +
    `colours, materials, logos and details from the references. Photorealistic, sharp ` +
    `focus, high resolution, square 1:1.`

  return runImageModel(refs, prompt, `the ${angle} view`)
}

/**
 * Clean up one existing product photo for e-commerce: white background, no
 * shadows, product straightened and centred. Unlike generateProductImage this
 * must NOT re-imagine the product — the source viewpoint has to survive intact.
 */
export async function cleanupProductImage(ref: RefImage): Promise<Billed<Buffer>> {
  const prompt =
    `Edit this exact product photo for an e-commerce catalog. Keep the product's ` +
    `viewpoint, pose, proportions, colours, materials, logos and printed text EXACTLY ` +
    `as in the source image — do not redraw, restyle, re-imagine or substitute the ` +
    `product, and do not change which side of it is facing the camera. COMPLETELY ` +
    `REMOVE the background and replace it with a flat, uniform, pure white background ` +
    `of exactly RGB(255,255,255). This applies even when the existing background is ` +
    `ALREADY light — an off-white, cream, pale grey, pale blue or soft studio backdrop ` +
    `is NOT acceptable and must still be replaced with pure RGB(255,255,255). Every ` +
    `pixel that is not the product itself must be exactly white. Remove every shadow, ` +
    `reflection, floor line, horizon, ` +
    `gradient, grey tone, studio backdrop, prop, hand, mannequin stand, overlaid text ` +
    `and watermark. Straighten the product so it sits upright and level, and centre it ` +
    `fully in frame with even margins. ` +
    `Retouch the product itself to catalog standard: remove dust, lint, fingerprints, ` +
    `smudges, stray threads, packaging creases, scratches, scuffs and visible wear from ` +
    `its surfaces. Even out the lighting, remove hotspots and colour casts, and restore ` +
    `the product's true colours. Render it crisp and in sharp focus with fine detail — ` +
    `fabric weave, material grain and printed text must stay legible and true to the ` +
    `source. Photorealistic, high resolution.`

  return runImageModel([ref], prompt, 'the cleaned image')
}
