import 'server-only'
import { GoogleGenAI, Type } from '@google/genai'

export const TEXT_MODEL = 'gemini-2.5-flash-lite'
export const IMAGE_MODEL = 'gemini-2.5-flash-image'

let client: GoogleGenAI | null = null
function genai(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set. Add it to the environment to run automations.')
  }
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  return client
}

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

  const res = await genai().models.generateContent({
    model: TEXT_MODEL,
    contents: `Product source data (JSON):\n${JSON.stringify(row)}`,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: { type: Type.OBJECT, properties, required: fields.map((f) => f.key) },
      temperature: 0.4,
    },
  })

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
    `Create a professional e-commerce product photograph of the SAME product shown in ` +
    `the reference images, viewed from the ${angle}. Requirements: pure solid white ` +
    `(#FFFFFF) seamless studio background; product centred with even margins; soft, even ` +
    `studio lighting with a subtle natural shadow; no props, hands, text, logos overlay, ` +
    `or watermarks. Preserve the exact colours, materials, shape and branding of the ` +
    `product from the references. Square 1:1 composition, sharp focus, high resolution.`

  const res = await genai().models.generateContent({
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
  })

  const parts = res.candidates?.[0]?.content?.parts ?? []
  for (const part of parts) {
    if (part.inlineData?.data) {
      return Buffer.from(part.inlineData.data, 'base64')
    }
  }
  throw new Error(`Model returned no image for the ${angle} view.`)
}
