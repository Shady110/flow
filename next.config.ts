import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  // The chatbot reads the company handbook off disk at request time
  // (lib/ai/knowledge.ts). Without this the .md files are not traced into the
  // serverless bundle and the route throws ENOENT in production only.
  outputFileTracingIncludes: {
    '/api/chat': ['./docs/**'],
    // Same trap as the handbook above: Satori needs the raw font files at
    // request time, and without this they are not traced into the serverless
    // bundle — so post rendering throws ENOENT in production only.
    '/api/social/render': ['./assets/fonts/**'],
  },
  // Keep the dev-tools badge out of BOTH bottom corners. Bottom-right is the
  // chat launcher (which it used to cover and steal clicks from) and bottom-left
  // is the cookie banner — and a dark circular badge sitting in either corner
  // reads as a second floating button, which is exactly how it got mistaken for
  // the chatbot. It only exists in development; production has one button.
  devIndicators: { position: 'top-left' },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
          // No Cache-Control here on purpose. This rule matches EVERY route, so
          // a blanket `immutable, max-age=1y` told browsers to cache HTML, RSC
          // payloads and API responses for a year and never revalidate — a
          // returning visitor kept seeing a stale page and never picked up a
          // deploy. Next already sends exactly this header for the one thing it
          // is safe on, the content-hashed assets under /_next/static.
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
