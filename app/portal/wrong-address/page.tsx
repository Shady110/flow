import { ClientAuthLayout } from '@/components/auth/AuthLayouts'
import { WrongAddress } from '@/components/auth/WrongAddress'

export default function Page() {
  return (
    <ClientAuthLayout>
      <WrongAddress portal="client" />
    </ClientAuthLayout>
  )
}
