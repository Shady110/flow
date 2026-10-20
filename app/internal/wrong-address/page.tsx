import { TeamAuthLayout } from '@/components/auth/AuthLayouts'
import { WrongAddress } from '@/components/auth/WrongAddress'

export default function Page() {
  return (
    <TeamAuthLayout>
      <WrongAddress portal="internal" />
    </TeamAuthLayout>
  )
}
