import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

export interface PortalSettings {
  /** Raw support WhatsApp number as typed in Company settings; build links with lib/contact.ts. */
  whatsapp: string | null
  /** How-to-pay text per language; empty when not set. */
  paymentInstructions: { en: string; ar: string }
}

/**
 * The few company settings a CLIENT may see. app_settings is internal-only under
 * RLS (it also holds the sales cap), so this reads an explicit allow-list with
 * the admin client instead of opening the table to clients.
 */
export async function getPortalSettings(): Promise<PortalSettings> {
  const { data } = await createAdminClient()
    .from('app_settings')
    .select('key, value')
    .in('key', ['support_whatsapp', 'payment_instructions'])
  const get = (k: string) => data?.find((r) => r.key === k)?.value
  const pay = (get('payment_instructions') ?? {}) as { en?: string; ar?: string }
  const wa = get('support_whatsapp')
  return {
    whatsapp: typeof wa === 'string' && wa.trim() ? wa : null,
    paymentInstructions: { en: pay.en ?? '', ar: pay.ar ?? '' },
  }
}
