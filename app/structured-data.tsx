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
                name: 'Complete Package — Photography + Listing',
                description:
                  'Studio photography + bilingual SEO listing — ' +
                  '40 EGP per product',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Photography Only',
                description:
                  'Professional studio product photography — ' +
                  '30 EGP per product',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Listing Optimization',
                description:
                  'SEO-optimized bilingual listing content — ' +
                  '15 EGP per product',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Account Management',
                description:
                  'Full marketplace account management — ' +
                  '5,000 EGP per month + 5% of sales',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Product Video',
                description:
                  'Professional product video production — ' +
                  '500 EGP per video',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Social Media Content',
                description:
                  'Full creative session with social media designs — ' +
                  'custom pricing per session',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'E-Commerce Website Creation',
                description:
                  'Custom e-commerce website design and development — ' +
                  'custom pricing',
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
                'FLOW Agency offers product photography starting from ' +
                '30 EGP per product, with bulk discounts available ' +
                'for 500+ and 1,000+ item batches.',
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
                'TikTok Shop, and Shopify. Pricing starts at 5,000 EGP ' +
                'per month plus 5% of sales.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does FLOW Agency build e-commerce websites in Egypt?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'Yes. FLOW Agency offers custom e-commerce website creation ' +
                'with custom pricing based on project scope. Contact us for ' +
                'a quote.',
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
