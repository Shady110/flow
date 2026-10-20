import { ClientAuthLayout } from '@/components/auth/AuthLayouts'
import { ForgotForm } from '@/components/auth/ForgotForm'

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const { expired } = await searchParams
  return (
    <ClientAuthLayout>
      <ForgotForm big={true} expired={expired === '1'} />
    </ClientAuthLayout>
  )
}
