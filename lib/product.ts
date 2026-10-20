/** The two products' names, in one place (layouts, sign-in screens, page titles, emails). */
export const PRODUCT = {
  internal: { name: 'Flow Pro', short: 'Pro', tagline: 'Run the agency in one place.' },
  client: { name: 'Flow Space', short: 'Space', tagline: 'Everything about your store, in one place.' },
} as const

export type ProductKey = keyof typeof PRODUCT
