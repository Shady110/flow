import { getTranslations } from 'next-intl/server'
import { MessageCircle } from 'lucide-react'
import { requireClientContext } from '@/lib/auth/client-session'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateMyConversation } from '@/lib/db/chat-actions'
import { getPortalSettings } from '@/lib/db/portal-settings'
import { whatsappUrl } from '@/lib/contact'
import type { Message } from '@/lib/types'
import { Button } from '@/components/ds/button'
import { ChatThread } from '@/components/chat/ChatThread'

export default async function PortalChat() {
  await requireClientContext()
  const [t, settings, conv] = await Promise.all([getTranslations('chat'), getPortalSettings(), getOrCreateMyConversation()])
  const wa = whatsappUrl(settings.whatsapp)

  if (!conv.ok) {
    return (
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-base text-destructive">{t('openFailed')}</p>
      </div>
    )
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conv.conversationId)
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="mt-1 text-base text-muted-foreground">{t('subtitle')}</p>
        </div>
        {wa && (
          <Button asChild size="lg" className="h-12 bg-[#0f7a5c] text-white hover:bg-[#0c6a50]">
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" /> {t('whatsapp')}
            </a>
          </Button>
        )}
      </div>

      {/* dvh, not vh: the browser bar and keyboard on phones change the real height. */}
      <div className="h-[calc(100dvh-19rem)] min-h-[22rem] overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-xs)] sm:h-[calc(100dvh-15rem)]">
        <ChatThread conversationId={conv.conversationId} initialMessages={(data as Message[]) ?? []} mySide="client" />
      </div>
    </div>
  )
}
