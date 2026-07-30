export default function StructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://flow-agency-eg.com/#organization',
        name: 'FLOW Agency',
        url: 'https://flow-agency-eg.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://flow-agency-eg.com/assets/Dark_Green_type_-_transparent.png',
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+201550408340',
            contactType: 'customer service',
            areaServed: ['EG', 'SA', 'AE', 'KW', 'QA', 'BH', 'JO'],
            availableLanguage: ['Arabic', 'English'],
          },
          {
            '@type': 'ContactPoint',
            telephone: '+201121443286',
            contactType: 'sales',
            areaServed: ['EG'],
            availableLanguage: ['Arabic', 'English'],
          },
          {
            '@type': 'ContactPoint',
            telephone: '+201125450608',
            contactType: 'sales',
            areaServed: ['EG'],
            availableLanguage: ['Arabic', 'English'],
          },
        ],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Cairo',
          addressCountry: 'EG',
        },
        email: 'flowagency.eg@gmail.com',
        sameAs: [
          'https://www.instagram.com/flowagency.eg',
          'https://www.facebook.com/flowagency.eg',
          'https://wa.me/201550408340',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://flow-agency-eg.com/#website',
        url: 'https://flow-agency-eg.com',
        name: 'FLOW Agency',
        description: 'E-Commerce Content Agency in Egypt',
        publisher: {
          '@id': 'https://flow-agency-eg.com/#organization',
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': 'https://flow-agency-eg.com/#localbusiness',
        name: 'FLOW Agency',
        image: 'https://flow-agency-eg.com/og-image.jpg',
        url: 'https://flow-agency-eg.com',
        telephone: '+201550408340',
        email: 'flowagency.eg@gmail.com',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Cairo',
          addressCountry: 'EG',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 30.0444,
          longitude: 31.2357,
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Sunday', 'Monday', 'Tuesday',
            'Wednesday', 'Thursday',
          ],
          opens: '09:00',
          closes: '18:00',
        },
        priceRange: '$$',
        description:
          'Professional e-commerce content agency offering product ' +
          'photography, listing optimization, account management, and ' +
          'marketplace management for Amazon, Noon, TikTok Shop and ' +
          'Shopify sellers in Egypt.',
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'E-Commerce Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Growth Plan — Growth',
                description:
                  'Listing, studio photography and full account management ' +
                  'for up to 150 products — 8,000 EGP per month + a flat 1% of sales',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Growth Plan — Starter',
                description:
                  'Listing, studio photography and full account management ' +
                  'for up to 50 products — 3,500 EGP per month + a flat 1% of sales',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Growth Plan — Scale',
                description:
                  'Listing, studio photography and full account management ' +
                  'for up to 400 products — 18,000 EGP per month + a flat 1% of sales',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Account Management — Premium',
                description:
                  'Full marketplace account management including FBA ' +
                  "inventory, PO's, Brand Registry and price analysis — " +
                  '5,000 EGP per month + 2% of sales',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Account Management — Basic',
                description:
                  'Seller account setup, item uploads, returns and reporting — ' +
                  '2,500 EGP per month + 1% of sales',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Full Content — Photography + Listing',
                description:
                  'Studio photography + bilingual SEO listing — ' +
                  '35 EGP per item',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Photography',
                description:
                  'Professional studio product photography — ' +
                  '30 EGP per item',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Listing',
                description:
                  'SEO-optimized bilingual listing content — ' +
                  '10 EGP per item',
              },
            },
          ],
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What e-commerce platforms does FLOW Agency work with?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'FLOW Agency works with Amazon, Noon, TikTok Shop, and ' +
                'Shopify sellers in Egypt and across the Arab world.',
            },
          },
          {
            '@type': 'Question',
            name: 'How much does product photography cost in Egypt?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'FLOW Agency offers product photography from 30 EGP per ' +
                'item, or 35 EGP for photography plus a bilingual SEO ' +
                'listing. Photography is included at no extra cost in the ' +
                'monthly growth plans, which start at 3,500 EGP per month.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does FLOW Agency provide Arabic product descriptions?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'Yes. All listing content is fully bilingual — Arabic ' +
                'and English — optimized for marketplace SEO on Amazon, ' +
                'Noon, and other platforms.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does FLOW Agency manage Amazon and Noon seller accounts?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'Yes. FLOW provides full marketplace account management ' +
                'including listing uploads, catalog management, performance ' +
                'tracking, and dedicated account support for Amazon, Noon, ' +
                'TikTok Shop, and Shopify. Account management starts at ' +
                '2,500 EGP per month plus 1% of sales, or is bundled with ' +
                'content in the growth plans from 3,500 EGP per month.',
            },
          },
          {
            '@type': 'Question',
            name: 'How much does it cost to have FLOW manage my store monthly?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'FLOW’s monthly growth plans bundle listing content, studio ' +
                'photography and full account management: Starter at 3,500 EGP ' +
                'per month for up to 50 products, Growth at 8,000 EGP for up ' +
                'to 150, and Scale at 18,000 EGP for up to 400. Every plan adds ' +
                'a flat 1% of sales, and products beyond the plan count are ' +
                'billed at 35, 25 or 20 EGP per item depending on the plan.',
            },
          },
          {
            '@type': 'Question',
            name: 'How can I contact FLOW Agency in Cairo?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'You can reach FLOW Agency by phone or WhatsApp at ' +
                '01550408340, 01121443286, or 01125450608. ' +
                'Or email us at flowagency.eg@gmail.com. ' +
                'We are based in Cairo, Egypt.',
            },
          },
        ],
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
