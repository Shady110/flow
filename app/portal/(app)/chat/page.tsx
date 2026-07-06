import { requireClientContext } from '@/lib/auth/client-session'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateMyConversation } from '@/lib/db/chat-actions'
import type { Message } from '@/lib/types'
import { Card } from '@/components/ds/card'
import { ChatThread } from '@/components/chat/ChatThread'

export default async function PortalChat() {
  await requireClientContext()
  const conv = await getOrCreateMyConversation()

  if (!conv.ok) {
    return (
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight">Chat</h1>
        <p className="text-sm text-destructive">Couldn&apos;t open the chat: {conv.error}</p>
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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Chat with FLOW</h1>
        <p className="mt-1 text-sm text-muted-foreground">Private line to your account team.</p>
      </div>

      <Card className="h-[calc(100vh-16rem)] overflow-hidden p-0">
        <ChatThread
          conversationId={conv.conversationId}
          initialMessages={(data as Message[]) ?? []}
          mySide="client"
        />
      </Card>
    </div>
  )
}
