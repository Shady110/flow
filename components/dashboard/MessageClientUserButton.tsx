'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { getOrCreateConversationForClientUser } from '@/lib/db/chat-actions'
import { Button } from '@/components/ds/button'

export function MessageClientUserButton({
  clientUserId,
  clientId,
}: {
  clientUserId: string
  clientId: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await getOrCreateConversationForClientUser(clientUserId, clientId)
          if (!res.ok) {
            toast.error(res.error)
            return
          }
          router.push(`/inbox/${res.conversationId}`)
        })
      }
    >
      <MessageSquare className="h-4 w-4" /> Message
    </Button>
  )
}
