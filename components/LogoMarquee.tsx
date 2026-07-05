'use client'

/**
 * All logos use:  filter: brightness(0) opacity(0.45)
 *
 * brightness(0) collapses every color channel to 0 (black).
 * opacity(0.45) on white page background → perceived neutral gray.
 * Works for dark-fill logos, white-fill logos (Shopify, TikTok Shop),
 * and colorful logos (Amazon orange, Instagram gradient) alike.
 */

const FILTER = 'brightness(0) opacity(0.45)'
const H = 26 // uniform logo height in px

interface LogoEntry {
  id: string
  alt: string
  src: string
  height?: number
}

const logos: LogoEntry[] = [
  {
    id: 'amazon',
    alt: 'Amazon',
    src: '/assets/logos/amazon.svg',
  },
  {
    id: 'noon',
    alt: 'Noon',
    src: '/assets/logos/Noon_idGLBkpII8_1.svg',
  },
  {
    id: 'instashop',
    alt: 'InstaShop',
    src: '/assets/logos/instashop-seeklogo-2.svg',
  },
  {
    id: 'tiktok-shop',
    alt: 'TikTok Shop',
    src: '/assets/logos/TikTok_Shop_iddUcX-Y2o_1.svg',
  },
  {
    id: 'instagram',
    alt: 'Instagram',
    src: '/assets/logos/Instagram_Logo_0.svg',
  },
  {
    id: 'shopify',
    alt: 'Shopify',
    src: '/assets/logos/Shopify-com_Logo_0.svg',
  },
  {
    id: 'symbol',
    alt: 'Symbol',
    src: '/assets/logos/Symbol.png',
  },
  {
    id: 'extra',
    alt: 'Brand',
    src: '/assets/logos/idFIQ5KAQx_logos.png',
  },
]

export default function LogoMarquee() {
  return (
    <div className="w-full">

      {/* Fade edges */}
      <div
        className="relative overflow-hidden"
        style={{
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          maskImage:
            'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      >
        {/* Double the logos for a seamless infinite loop */}
        <div className="flex items-center gap-16 w-max animate-marquee">
          {[...logos, ...logos].map((logo, i) => (
            <div
              key={`${logo.id}-${i}`}
              className="shrink-0 hover:opacity-80 transition-opacity duration-300"
              style={{ opacity: 1 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo.src}
                alt={logo.alt}
                style={{
                  height: logo.height ?? H,
                  width: 'auto',
                  maxWidth: 240,
                  objectFit: 'contain',
                  filter: FILTER,
                  display: 'block',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
