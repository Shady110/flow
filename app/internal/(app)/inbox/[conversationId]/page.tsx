import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { requirePermission } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import type { Message } from '@/lib/types'
import { Card } from '@/components/ds/card'
import { ChatThread } from '@/components/chat/ChatThread'

export default async function InboxThreadPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  await requirePermission('chat.access')
  const { conversationId } = await params
  const supabase = await createClient()

  const { data: conv } = await supabase
    .from('conversations')
    .select('id, client_id, client:clients(name), client_user:client_users(full_name, email)')
    .eq('id', conversationId)
    .maybeSingle()
  if (!conv) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  const cu = Array.isArray(conv.client_user) ? conv.client_user[0] : conv.client_user
  const cl = Array.isArray(conv.client) ? conv.client[0] : conv.client

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/inbox" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-lg font-bold">{cu?.full_name ?? 'Conversation'}</h1>
          <p className="text-xs text-muted-foreground">
            {cl?.name} · {cu?.email}
          </p>
        </div>
      </div>

      <Card className="h-[calc(100vh-14rem)] overflow-hidden p-0">
        <ChatThread
          conversationId={conversationId}
          initialMessages={(messages as Message[]) ?? []}
          mySide="admin"
        />
      </Card>
    </div>
  )
}
