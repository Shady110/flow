import { requireUser } from '@/lib/auth/session'
import { AccountView } from '@/components/auth/AccountView'

export default async function AccountPage() {
  const user = await requireUser()
  return <AccountView userId={user.id} email={user.email} />
}
