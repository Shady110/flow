import 'server-only'
import { GoogleGenAI, Type, Modality } from '@google/genai'
import { withRetry, hardQuotaMessage } from '@/lib/ai/retry'

export const TEXT_MODEL = 'gemini-2.5-flash-lite'
export const IMAGE_MODEL = 'gemini-2.5-flash-image'

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
): Promise<Record<string, string>> {
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

  const text = res.text ?? '{}'
  try {
    return JSON.parse(text) as Record<string, string>
  } catch {
    return {}
  }
}

export interface RefImage {
  mimeType: string
  base64: string
}

/**
 * Generate one white-background e-commerce product image at the requested angle,
 * conditioned on the reference photos so the product identity stays consistent.
 * Returns raw PNG bytes.
 */
export async function generateProductImage(
  refs: RefImage[],
  angle: 'front' | 'side' | 'back',
): Promise<Buffer> {
  const prompt =
    `Produce a clean e-commerce catalog image of the SAME product shown in the reference ` +
    `images, viewed from the ${angle}. COMPLETELY REMOVE the original background and ` +
    `replace it with a flat, uniform, pure white background of exactly RGB(255,255,255). ` +
    `Absolutely no gradients, no grey tones, no studio backdrop, no floor or horizon line, ` +
    `no shadows, no reflections, no props, no hands, no text, no watermark. Show ONLY the ` +
    `product, fully in frame, upright and centred. Preserve the product's exact shape, ` +
    `colours, materials, logos and details from the references. Photorealistic, sharp ` +
    `focus, high resolution, square 1:1.`

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
        // Without IMAGE in responseModalities the model replies with text only.
        config: { responseModalities: [Modality.IMAGE] },
      }),
    )
  } catch (e) {
    throw new Error(hardQuotaMessage(e) ?? (e instanceof Error ? e.message : 'Image generation failed'))
  }

  const parts = res.candidates?.[0]?.content?.parts ?? []
  for (const part of parts) {
    if (part.inlineData?.data) {
      return Buffer.from(part.inlineData.data, 'base64')
    }
  }
  // Surface any text the model returned instead of an image (e.g. a refusal).
  const text = parts
    .map((p) => p.text)
    .filter(Boolean)
    .join(' ')
    .slice(0, 300)
  throw new Error(
    `No image returned for the ${angle} view${text ? `: ${text}` : '.'}`,
  )
}
