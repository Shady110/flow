import { ImageResponse } from 'next/og'
import { requirePermission } from '@/lib/auth/session'
import { loadBrandFonts } from '@/lib/social/render'
import { PostArtwork } from '@/lib/social/template'
import { SIZES, TEMPLATES, type SizeKey, type TemplateKey } from '@/lib/social/templates'

/**
 * Renders a post image from the real design system.
 *
 * The point of doing this here rather than in a design tool is that the output
 * cannot drift: same greens, same two weights of Funnel Display, same wordmark
 * as the website, because they come from the same place. One template renders
 * at any of the four sizes, so a design is not redrawn per platform.
 *
 * The drawing itself is in lib/social/template.tsx; this handler is only
 * permission, validation and font loading.
 *
 * `nodejs` runtime, not edge: the fonts are read off disk.
 */
export const runtime = 'nodejs'

export async function GET(req: Request) {
  // These images carry the company's wordmark and its prices. Rendering is not
  // a public endpoint, even though the resulting file ends up on a public feed.
  await requirePermission('social.view')

  const url = new URL(req.url)
  const template = (url.searchParams.get('template') ?? 'statement-dark') as TemplateKey
  const size = (url.searchParams.get('size') ?? 'square') as SizeKey

  if (!TEMPLATES.includes(template)) {
    return new Response(`Unknown template. Expected one of: ${TEMPLATES.join(', ')}`, { status: 400 })
  }
  if (!(size in SIZES)) {
    return new Response(`Unknown size. Expected one of: ${Object.keys(SIZES).join(', ')}`, { status: 400 })
  }

  const { width, height } = SIZES[size]
  const fonts = await loadBrandFonts()

  return new ImageResponse(
    (
      <PostArtwork
        template={template}
        size={size}
        headline={url.searchParams.get('headline') ?? 'From product to marketplace'}
        accent={url.searchParams.get('accent') ?? ''}
        kicker={url.searchParams.get('kicker') ?? ''}
        body={url.searchParams.get('body') ?? ''}
        // Repeatable: ?item=one&item=two
        items={url.searchParams.getAll('item')}
      />
    ),
    { width, height, fonts },
  )
}
