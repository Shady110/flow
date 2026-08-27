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
  },
  // The dev-tools badge defaults to bottom-right, exactly where the chat
  // launcher sits — it covers the button and steals its clicks in development.
  devIndicators: { position: 'bottom-left' },
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
