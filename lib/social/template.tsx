import { BRAND, SIZES, LIGHT_TEMPLATES, type SizeKey, type TemplateKey } from './templates'

/**
 * The post artwork itself.
 *
 * Lives apart from the route so the drawing can be rendered without going
 * through auth and HTTP — the route is then only param validation and a
 * permission check, and this can be exercised directly.
 *
 * Satori constraints that shape everything below: no CSS variables, no cascade,
 * no `rem`, and every element that has more than one child must declare
 * `display: flex`. So each value is explicit and each colour is a literal from
 * BRAND rather than a token reference.
 */
export interface TemplateProps {
  template: TemplateKey
  size: SizeKey
  headline: string
  accent?: string
  kicker?: string
  body?: string
  items?: string[]
}

const px = (n: number) => `${n}px`

/**
 * Display size by template, then trimmed for long headlines. Satori does not
 * reflow to fit, so a 90-character hook at 78px silently overflows the frame
 * instead of shrinking — the length check is what stops that.
 */
function headlineSize(template: TemplateKey, headline: string): number {
  const base = template === 'stat-card' ? 150 : template === 'quote-dark' ? 64 : 78
  if (headline.length > 90) return base * 0.62
  if (headline.length > 60) return base * 0.78
  return base
}

export function PostArtwork({
  template,
  size,
  headline,
  accent = '',
  kicker = '',
  body = '',
  items = [],
}: TemplateProps) {
  const { width, height } = SIZES[size]

  // Type scales off the frame rather than being hard-coded per size, so one
  // template holds together from a 627px banner to a 1920px story.
  const unit = Math.min(width, height) / 1080
  const dark = !LIGHT_TEMPLATES.includes(template)
  // A reel or carousel cover leads with the hook and nothing else — the
  // remaining frames are a person's job, and crowding the cover with body
  // copy misrepresents what the still actually is.
  const coverOnly = template === 'reel-cover' || template === 'carousel-cover'

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: px(80 * unit),
        background: dark ? BRAND.greenDeep : BRAND.bone,
        fontFamily: 'Didact Gothic',
        color: dark ? BRAND.onDark : BRAND.ink,
      }}
    >
      {/* Kicker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: px(18 * unit) }}>
        <div
          style={{
            width: px(40 * unit),
            height: px(4 * unit),
            background: BRAND.lime,
            borderRadius: px(2 * unit),
          }}
        />
        <div
          style={{
            display: 'flex',
            fontFamily: 'Funnel Display',
            fontWeight: 700,
            fontSize: px(22 * unit),
            letterSpacing: px(3 * unit),
            textTransform: 'uppercase',
            color: dark ? BRAND.lime : BRAND.inkMuted,
          }}
        >
          {kicker || 'FLOW'}
        </div>
      </div>

      {/* Body.

          `flex: 1` with the content pushed to the end, rather than letting
          space-between centre it: three children under space-between park the
          headline in the middle of the frame with a dead gap above and below,
          which at 1080×1350 is most of the image. Anchoring it just above the
          footer rule is the editorial composition and matches the site. */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: px(28 * unit),
          paddingBottom: px(40 * unit),
        }}
      >
        {coverOnly ? (
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              padding: `${px(10 * unit)} ${px(22 * unit)}`,
              borderRadius: px(999),
              background: BRAND.lime,
              color: BRAND.green,
              fontFamily: 'Funnel Display',
              fontWeight: 700,
              fontSize: px(22 * unit),
              letterSpacing: px(1 * unit),
              textTransform: 'uppercase',
            }}
          >
            {template === 'reel-cover' ? 'Reel' : 'Swipe'}
          </div>
        ) : null}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            fontFamily: 'Funnel Display',
            fontWeight: 700,
            fontSize: px(headlineSize(template, headline) * unit),
            lineHeight: 1.02,
            letterSpacing: px(-3 * unit),
            color: dark ? BRAND.onDark : BRAND.green,
          }}
        >
          {headline}
          {accent ? <span style={{ color: BRAND.lime, marginLeft: px(16 * unit) }}>{accent}</span> : null}
        </div>

        {body && !coverOnly ? (
          <div
            style={{
              display: 'flex',
              fontSize: px(30 * unit),
              lineHeight: 1.5,
              maxWidth: px(820 * unit),
              color: dark ? BRAND.onDarkMuted : BRAND.inkMuted,
            }}
          >
            {body}
          </div>
        ) : null}

        {items.length > 0 && !coverOnly ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: px(14 * unit) }}>
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: px(20 * unit),
                  padding: `${px(20 * unit)} ${px(26 * unit)}`,
                  borderRadius: px(18 * unit),
                  fontSize: px(28 * unit),
                  border: `${px(2 * unit)} solid ${dark ? 'rgba(255,255,255,0.12)' : BRAND.border}`,
                  background: dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
                  color: dark ? BRAND.onDark : BRAND.ink,
                }}
              >
                <div
                  style={{
                    width: px(14 * unit),
                    height: px(14 * unit),
                    borderRadius: px(4 * unit),
                    background: BRAND.lime,
                  }}
                />
                {item}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Footer rule + wordmark. Drawn rather than loaded: an <img> here would
          mean a network fetch inside the renderer for a shape this simple. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: px(28 * unit),
          borderTop: `${px(2 * unit)} solid ${dark ? 'rgba(255,255,255,0.14)' : BRAND.border}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: 'Funnel Display',
            fontWeight: 700,
            fontSize: px(34 * unit),
            letterSpacing: px(-1 * unit),
            color: dark ? BRAND.onDark : BRAND.green,
          }}
        >
          FLOW
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: px(24 * unit),
            color: dark ? BRAND.onDarkMuted : BRAND.inkMuted,
          }}
        >
          flow-agency-eg.com
        </div>
      </div>
    </div>
  )
}
