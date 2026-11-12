import { requireClientContext } from '@/lib/auth/client-session'
import { AccountView } from '@/components/auth/AccountView'

export default async function AccountPage() {
  const { clientUser, email } = await requireClientContext()
  return <AccountView userId={clientUser.user_id!} email={email} />
}
